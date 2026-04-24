'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { fetchJobs, setSelectedJob } from "@/src/store/jobsSlice";
import { fetchCandidates, addCandidate, uploadCandidatesCSV } from "@/src/store/candidatesSlice";
import DashboardLayout from "@/src/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Loader2, Plus, Upload, Users } from "lucide-react";
import { toast } from "sonner";

const Candidates = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { jobs, selectedJobId } = useAppSelector((state) => state.jobs);
  const { candidates, loading } = useAppSelector((state) => state.candidates);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", resume_text: "", skills: "" });

  // Fetch jobs on mount
  useEffect(() => {
    if (user) {
      dispatch(fetchJobs(user.id));
    }
  }, [user, dispatch]);

  // Set selected job from URL or Redux
  useEffect(() => {
    const jobFromUrl = searchParams.get("job");
    if (jobFromUrl) {
      dispatch(setSelectedJob(jobFromUrl));
    } else if (!selectedJobId && jobs.length > 0) {
      dispatch(setSelectedJob(jobs[0].id));
    }
  }, [searchParams, jobs, selectedJobId, dispatch]);

  // Fetch candidates when job changes
  useEffect(() => {
    if (user && selectedJobId) {
      dispatch(fetchCandidates({ userId: user.id, jobId: selectedJobId }));
    }
  }, [user, selectedJobId, dispatch]);

  const addCandidateHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedJobId) return;
    try {
      await dispatch(addCandidate({
        user_id: user.id,
        job_id: selectedJobId,
        name: form.name,
        email: form.email,
        resume_text: form.resume_text,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      })).unwrap();
      toast.success("Candidate added!");
      setForm({ name: "", email: "", resume_text: "", skills: "" });
      setShowForm(false);
    } catch (err: any) {
      toast.error(err || "Failed to add candidate");
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedJobId) return;

    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    const header = lines[0].toLowerCase();

    if (!header.includes("name")) {
      toast.error("CSV must have a 'name' column");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const emailIdx = headers.indexOf("email");
    const skillsIdx = headers.indexOf("skills");
    const resumeIdx = headers.indexOf("resume_text");

    const rows = lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      return {
        user_id: user.id,
        job_id: selectedJobId,
        name: cols[nameIdx] || "",
        email: emailIdx >= 0 ? cols[emailIdx] : "",
        skills: skillsIdx >= 0 ? cols[skillsIdx]?.split(";").map((s) => s.trim()) : [],
        resume_text: resumeIdx >= 0 ? cols[resumeIdx] : "",
      };
    }).filter((r) => r.name);

    try {
      await dispatch(uploadCandidatesCSV({ candidates: rows })).unwrap();
      toast.success(`${rows.length} candidates uploaded!`);
    } catch (err: any) {
      toast.error(err || "Failed to upload CSV");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Candidates</h1>
          <div className="flex gap-2">
            <div className="relative">
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <Button variant="outline">
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4" />
              Add Manually
            </Button>
          </div>
        </div>

        {/* Job selector */}
        <div className="w-full max-w-sm">
          <Label className="mb-2 block">Select Job</Label>
          <Select value={selectedJobId || ""} onValueChange={(value) => dispatch(setSelectedJob(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a job..." />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>{job.title} — {job.department}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add candidate form */}
        {showForm && selectedJobId && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Add Candidate</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addCandidateHandler} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Resume / Experience Summary</Label>
                  <Textarea value={form.resume_text} onChange={(e) => setForm({ ...form, resume_text: e.target.value })} rows={4} placeholder="Paste resume text or experience summary..." required />
                </div>
                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, TypeScript, Node.js" />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Candidate
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Candidates list */}
        <Card>
          <CardContent className="p-0">
            {candidates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No candidates yet. Add them manually or upload a CSV.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {candidates.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Avatar initials */}
                      <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {(c.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-sm text-muted-foreground">{c.email}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {(c.skills || []).slice(0, 5).map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                          {(c.skills || []).length > 5 && (
                            <Badge variant="outline" className="text-xs">+{c.skills.length - 5}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedJobId && candidates.length > 0 && (
          <Button asChild className="w-full" size="lg">
            <Link href={`/results?job=${selectedJobId}`}>
              Screen Candidates with AI →
            </Link>
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Candidates;
