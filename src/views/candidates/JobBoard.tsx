'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import CandidateLayout from "@/src/components/CandidateLayout";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Briefcase, Search, MapPin, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const JobBoard = () => {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [applyingTo, setApplyingTo] = useState<any | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;
    const load = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch(`${BASE_URL}/jobs/public`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/candidates/applications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData);
        }
        
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setAppliedJobs(new Set(appsData.map((a: any) => a.job_id || a.jobId)));
        }
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, token]);

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    return !q || j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q) || (j.required_skills || j.skills || []).some((s: string) => s.toLowerCase().includes(q));
  });

  const handleApply = async () => {
    if (!user || !token || !applyingTo) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/candidates/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_id: applyingTo.id || applyingTo._id,
          resume_text: resumeText,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      
      if (!res.ok) throw new Error("Failed to submit application");
      
      setAppliedJobs((prev) => new Set(prev).add(applyingTo.id || applyingTo._id));
      toast.success("Application submitted! You'll receive AI feedback once reviewed.");
      setApplyingTo(null);
      setResumeText("");
      setSkills("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Job Board</h1>
          <p className="text-muted-foreground">Browse open positions and apply with one click</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by title, department, or skill..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No jobs found. Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map((job) => {
              const jobId = job.id || job._id;
              return (
                <Card key={jobId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.department}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.experience_level || job.experience}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{job.description}</p>
                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          {(job.required_skills || job.skills || []).map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {appliedJobs.has(jobId) ? (
                          <Button disabled variant="outline" className="gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                            Applied
                          </Button>
                        ) : (
                          <Button onClick={() => setApplyingTo(job)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!applyingTo} onOpenChange={() => setApplyingTo(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Apply to {applyingTo?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Resume / Experience Summary</Label>
                <Textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={6} placeholder="Paste your resume or describe your experience..." required />
              </div>
              <div className="space-y-2">
                <Label>Skills (comma-separated)</Label>
                <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApplyingTo(null)}>Cancel</Button>
              <Button onClick={handleApply} disabled={submitting || !resumeText.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CandidateLayout>
  );
};

export default JobBoard;
