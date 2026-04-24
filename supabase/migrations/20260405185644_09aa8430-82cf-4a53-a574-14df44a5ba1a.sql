
-- Add role to profiles
ALTER TABLE public.profiles ADD COLUMN role text NOT NULL DEFAULT 'recruiter';

-- Create applications table
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  resume_text text DEFAULT '',
  skills text[] DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Candidates can view own applications
CREATE POLICY "Candidates can view own applications"
ON public.applications FOR SELECT
USING (auth.uid() = user_id);

-- Candidates can create applications
CREATE POLICY "Candidates can insert own applications"
ON public.applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Recruiters can view applications for their jobs
CREATE POLICY "Recruiters can view job applications"
ON public.applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.user_id = auth.uid()
  )
);

-- Recruiters can update application status
CREATE POLICY "Recruiters can update application status"
ON public.applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.user_id = auth.uid()
  )
);

-- Create candidate_feedback table
CREATE TABLE public.candidate_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  final_score integer NOT NULL DEFAULT 0,
  strengths text[] DEFAULT '{}'::text[],
  gaps text[] DEFAULT '{}'::text[],
  improvement_tips text[] DEFAULT '{}'::text[],
  status_reason text DEFAULT '',
  culture_fit text DEFAULT 'Medium',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.candidate_feedback ENABLE ROW LEVEL SECURITY;

-- Candidates view own feedback
CREATE POLICY "Candidates can view own feedback"
ON public.candidate_feedback FOR SELECT
USING (auth.uid() = user_id);

-- Recruiters can insert feedback for their jobs
CREATE POLICY "Recruiters can insert feedback"
ON public.candidate_feedback FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = candidate_feedback.job_id AND jobs.user_id = auth.uid()
  )
);

-- Recruiters can view feedback for their jobs
CREATE POLICY "Recruiters can view feedback for their jobs"
ON public.candidate_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = candidate_feedback.job_id AND jobs.user_id = auth.uid()
  )
);

-- Allow candidates to view all jobs (public job board)
CREATE POLICY "Anyone authenticated can view jobs"
ON public.jobs FOR SELECT TO authenticated
USING (true);

-- Drop the old restrictive select policy on jobs
DROP POLICY IF EXISTS "Users can view own jobs" ON public.jobs;

-- Add trigger for applications updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_candidate_feedback_user_id ON public.candidate_feedback(user_id);
CREATE INDEX idx_candidate_feedback_application_id ON public.candidate_feedback(application_id);
