'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { fetchJobs, deleteJob } from "@/src/store/jobsSlice";
import DashboardLayout from "@/src/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  Briefcase,
  Users,
  BarChart3,
  Plus,
  Sparkles,
  Upload,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import DeleteJobDialog from "@/src/components/DeleteJobDialog";
import { toast } from "sonner";

/* ── Tiny inline sparkline ────────────────────────────────────── */
const Sparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 1);
  const h = 28;
  const w = 80;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="opacity-40">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* ── Ghost card for empty-state launchpad ─────────────────────── */
const GhostCard = ({
  step,
  title,
  description,
  icon: Icon,
  href,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}) => (
  <Link href={href} className="group block">
    <div className="rounded-md border border-dashed border-silver p-5 hover:border-primary/40 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 shrink-0 rounded-full bg-burgundy/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">
            Step {step}
          </p>
          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);

/* ── Activity item ────────────────────────────────────────────── */
const ActivityItem = ({
  label,
  time,
  done,
}: {
  label: string;
  time?: string;
  done?: boolean;
}) => (
  <div className="flex items-start gap-3 py-2.5">
    {done ? (
      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
    ) : (
      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground leading-tight">{label}</p>
      {time && (
        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
      )}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { jobs, loading: jobsLoading } = useAppSelector((state) => state.jobs);
  const [stats, setStats] = useState({ jobs: 0, candidates: 0, screenings: 0 });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [demoLoaded, setDemoLoaded] = useState(false);

  // Check demo loaded status after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDemoLoaded(!!localStorage.getItem("demo_loaded"));
    }
  }, []);

  // Fetch jobs from Redux
  useEffect(() => {
    if (user) {
      dispatch(fetchJobs(user.id));
    }
  }, [user, dispatch]);

  // Calculate stats
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [candsRes, screensRes] = await Promise.all([
        supabase.from("candidates").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("screening_results").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setStats({
        jobs: jobs.length,
        candidates: candsRes.count ?? 0,
        screenings: screensRes.count ?? 0,
      });
    };
    load();
  }, [user, jobs]);

  const loadDemo = async () => {
    if (!user) return;
    try {
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          title: "Senior Full-Stack Engineer",
          department: "Engineering",
          description:
            "We're looking for a senior full-stack engineer to lead feature development on our core product. The ideal candidate thrives in fast-paced environments, takes ownership, and mentors junior developers.",
          required_skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "System Design"],
          experience_level: "Senior (5+ years)",
          top_performer_profile:
            "Our top performers are proactive problem-solvers who take ownership of projects end-to-end. They collaborate cross-functionally, mentor others, and balance speed with quality.",
          weight_skills: 40,
          weight_experience: 30,
          weight_culture: 30,
        })
        .select()
        .single();

      if (jobError) throw jobError;

      const demoCandidates = [
        { name: "Amara Okafor", email: "amara.o@email.com", resume_text: "8 years full-stack development. Led migration of monolith to microservices at fintech startup. Mentored 4 junior developers. Built real-time analytics dashboard serving 10M users. Strong advocate for code reviews and test-driven development. Founded internal tech talks program.", skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "Mentoring"] },
        { name: "James Chen", email: "james.c@email.com", resume_text: "6 years experience. Specialized in frontend with React and Vue. Built component libraries adopted by 3 product teams. Some backend experience with Express. Passionate about accessibility and performance optimization. Active open-source contributor.", skills: ["React", "Vue.js", "TypeScript", "CSS", "Accessibility", "Performance"] },
        { name: "Sofia Martinez", email: "sofia.m@email.com", resume_text: "5 years as backend engineer transitioning to full-stack. Expert in PostgreSQL and system design. Built event-driven architecture handling 50K events/sec. Learning React through side projects. Strong problem-solving skills demonstrated in hackathon wins.", skills: ["PostgreSQL", "Node.js", "System Design", "Python", "Redis", "React"] },
        { name: "David Park", email: "david.p@email.com", resume_text: "10 years industry experience. Former tech lead at Fortune 500. Managed teams of 12 engineers. Deep expertise in scalable architecture. Recently freelancing on smaller projects. Prefers working independently.", skills: ["Java", "React", "System Design", "Leadership", "Microservices", "Kubernetes"] },
        { name: "Fatima Al-Hassan", email: "fatima.a@email.com", resume_text: "3 years experience but exceptionally fast learner. Built 2 SaaS products from scratch as solo developer. Strong TypeScript and React skills. Active in developer communities. Eager to join a collaborative team and grow.", skills: ["React", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS"] },
        { name: "Marcus Johnson", email: "marcus.j@email.com", resume_text: "7 years full-stack. Specialized in e-commerce platforms. Built checkout systems processing $50M annually. Strong testing culture advocate with 95% code coverage standards. Excellent team player known for clear communication.", skills: ["React", "Node.js", "PostgreSQL", "Stripe", "Testing", "CI/CD"] },
        { name: "Priya Sharma", email: "priya.s@email.com", resume_text: "4 years experience. Data engineering background moving into full-stack. Built ML pipelines and data visualization dashboards. Strong analytical mindset. Learning modern frontend frameworks. Published 2 papers on data optimization.", skills: ["Python", "SQL", "React", "Data Visualization", "Machine Learning"] },
        { name: "Alex Thompson", email: "alex.t@email.com", resume_text: "9 years experience across startups and enterprise. Jack of all trades - frontend, backend, DevOps. Known for shipping fast and iterating. Built products used by 1M+ users. Sometimes prioritizes speed over code quality.", skills: ["React", "TypeScript", "Go", "AWS", "Terraform", "Node.js"] },
      ];

      const { error: candError } = await supabase
        .from("candidates")
        .insert(demoCandidates.map((c) => ({ ...c, user_id: user.id, job_id: job.id })));
      if (candError) throw candError;

      if (typeof window !== "undefined") {
        localStorage.setItem("demo_loaded", "1");
        setDemoLoaded(true);
      }
      toast.success("Demo data loaded! Check your jobs and candidates.");
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteTarget || !user) return;
    await dispatch(deleteJob({ jobId: deleteTarget.id, userId: user.id }));
    toast.success(`"${deleteTarget.title}" has been deleted.`);
    setDeleteTarget(null);
  };

  const recentJobs = jobs.slice(0, 5);
  const hasData = stats.jobs > 0 || stats.candidates > 0;

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        {/* ── Main column ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Welcome back, {user?.user_metadata?.name || "Recruiter"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Overview of your recruitment funnel today.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {stats.jobs === 0 && !demoLoaded && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDemo}
                  className="text-muted-foreground"
                >
                  <Sparkles className="h-4 w-4" />
                  Load Demo
                </Button>
              )}
              <Button size="sm" className="shadow-sm hover:-translate-y-0.5 transition-transform">
                <Link href="/jobs/new" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Job
                </Link>
              </Button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Active Jobs",
                value: stats.jobs,
                icon: Briefcase,
                spark: [0, 1, 1, 2, 2, 3, stats.jobs],
              },
              {
                label: "Total Candidates",
                value: stats.candidates,
                icon: Users,
                spark: [0, 2, 3, 5, 4, 6, stats.candidates],
              },
              {
                label: "Screenings Complete",
                value: stats.screenings,
                icon: BarChart3,
                spark: [0, 0, 1, 1, 2, 2, stats.screenings],
              },
            ].map((s) => (
              <Card
                key={s.label}
                className="shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] border-silver/60"
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-burgundy/10 flex items-center justify-center">
                      <s.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-none text-foreground">
                        {s.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {s.label}
                      </p>
                    </div>
                  </div>
                  <Sparkline data={s.spark} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Launchpad OR Recent Jobs */}
          {!hasData ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Getting Started
              </h2>
              <div className="grid gap-3">
                <GhostCard
                  step={1}
                  title="Create Your First Job"
                  description="Define the role, required skills, and what great looks like."
                  icon={Briefcase}
                  href="/jobs/new"
                />
                <GhostCard
                  step={2}
                  title="Upload Candidates"
                  description="Add resumes and candidate profiles for AI screening."
                  icon={Upload}
                  href="/candidates"
                />
                <GhostCard
                  step={3}
                  title="View Insights"
                  description="Review AI-powered screening results and ranked candidates."
                  icon={Eye}
                  href="/results"
                />
              </div>
            </div>
          ) : (
            <Card className="shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] border-silver/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground">
                  Recent Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-silver/60">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between py-3 group"
                    >
                      <Link
                        href={`/candidates?job=${job.id}`}
                        className="flex-1 min-w-0"
                      >
                        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {job.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {job.department}
                        </p>
                      </Link>
                      <div className="flex items-center gap-1 shrink-0 ml-3">
                        <button
                          onClick={() => setDeleteTarget({ id: job.id, title: job.title })}
                          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                          title="Delete job"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <Link href={`/candidates?job=${job.id}`}>
                          <ArrowUpRight className="h-4 w-4 text-foreground/70 group-hover:text-primary transition-colors" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right sidebar ────────────────────────────────────── */}
        <aside className="hidden lg:block w-72 shrink-0 space-y-5">
          {/* Activity Feed */}
          <Card className="shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] border-silver/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                System Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {hasData ? (
                <div className="divide-y divide-silver/60">
                  <ActivityItem
                    label="Job created — Senior Full-Stack Engineer"
                    time="Just now"
                    done
                  />
                  <ActivityItem
                    label={`${stats.candidates} candidate${stats.candidates !== 1 ? "s" : ""} uploaded`}
                    time="Recently"
                    done={stats.candidates > 0}
                  />
                  <ActivityItem
                    label={`${stats.screenings} screening${stats.screenings !== 1 ? "s" : ""} completed`}
                    time="Pending"
                    done={stats.screenings > 0}
                  />
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-silver/60">
                  <ActivityItem label="Create your first job posting" />
                  <ActivityItem label="Upload candidate resumes" />
                  <ActivityItem label="Run AI-powered screening" />
                  <ActivityItem label="Review ranked results" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick stats summary */}
          <Card className="shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] border-silver/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Funnel Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                { label: "Open Positions", value: stats.jobs },
                { label: "In Pipeline", value: stats.candidates },
                { label: "Screened", value: stats.screenings },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
      <DeleteJobDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        jobTitle={deleteTarget?.title ?? ""}
        onConfirm={handleDeleteJob}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
