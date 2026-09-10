'use client';

import { useState, useEffect, useMemo } from "react";
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
import { Loader2, Plus, Upload, Users, Search, Download, X } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const exportToCSV = (candidates: any[], jobTitle: string) => {
  const headers = ["Name", "Email", "Skills", "Status", "Score", "Strengths", "Gaps", "Recommendation"];
  const rows = candidates.map(c => [
    c.name || "",
    c.email || "",
    (c.skills || []).join("; "),
    c.status || "",
    c.score ?? "",
    (c.strengths || []).join("; "),
    (c.gaps || []).join("; "),
    c.recommendation || "",
  ]);
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `candidates-${jobTitle.toLowerCase().replace(/\s+/g, "-") || "export"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const Candidates = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { jobs, selectedJobId } = useAppSelector((state) => state.jobs);
  const { candidates, loading } = useAppSelector((state) => state.candidates);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", resume_text: "", skills: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "screened" | "pending">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user) dispatch(fetchJobs(user.id));
  }, [user, dispatch]);

  useEffect(() => {
    const jobFromUrl = searchParams.get("job");
    if (jobFromUrl) {
      dispatch(setSelectedJob(jobFromUrl));
    } else if (!selectedJobId && jobs.length > 0) {
      dispatch(setSelectedJob((jobs[0] as any)._id || jobs[0].id));
    }
  }, [searchParams, jobs, selectedJobId, dispatch]);

  useEffect(() => {
    if (user && selectedJobId) {
      dispatch(fetchCandidates({ userId: user.id, jobId: selectedJobId }));
    }
    setPage(1);
    setSearchTerm("");
    setStatusFilter("all");
  }, [user, selectedJobId, dispatch]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c: any) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        (c.skills || []).some((s: string) => s.toLowerCase().includes(term));
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "screened" && c.status === "screened") ||
        (statusFilter === "pending" && c.status !== "screened");
      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredCandidates.length / PAGE_SIZE);
  const paginatedCandidates = filteredCandidates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const addCandidateHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedJobId) return;
    try {
      await dispatch(addCandidate({
        jobId: selectedJobId,
        name: form.name,
        email: form.email,
        resume_text: form.resume_text,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      })).unwrap();
      toast.success("Candidate added!");
      setForm({ name: "", email: "", resume_text: "", skills: "" });
      setShowForm(false);
      dispatch(fetchCandidates({ userId: user.id, jobId: selectedJobId }));
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : err?.message || "Failed to add candidate");
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedJobId) return;
    try {
      await dispatch(uploadCandidatesCSV({ jobId: selectedJobId, file })).unwrap();
      toast.success("Candidates uploaded!");
      dispatch(fetchCandidates({ userId: user.id, jobId: selectedJobId }));
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : err?.message || "Failed to upload CSV");
    }
  };

  const selectedJob = jobs.find((j: any) => (j._id || j.id) === selectedJobId) as any;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Candidates</h1>
          <div className="flex flex-wrap gap-2">
            {candidates.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => exportToCSV(candidates, selectedJob?.title || "")}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
            <div className="relative">
              <input type="file" accept=".csv,.xlsx" onChange={handleCSVUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
            </div>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
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
              {jobs.map((job: any) => (
                <SelectItem key={job._id || job.id} value={job._id || job.id}>
                  {job.title} — {job.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add form */}
        {showForm && selectedJobId && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Add Candidate</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addCandidateHandler} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Experience Summary</Label>
                  <Textarea value={form.resume_text} onChange={(e) => setForm({ ...form, resume_text: e.target.value })} rows={4} placeholder="Paste resume text or experience summary..." />
                </div>
                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, TypeScript, Node.js" />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Add Candidate
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search + filter */}
        {candidates.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or skill..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-9"
              />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All candidates</SelectItem>
                <SelectItem value="screened">Screened only</SelectItem>
                <SelectItem value="pending">Pending only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Candidate list */}
        <Card>
          <CardContent className="p-0">
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>{candidates.length === 0 ? "No candidates yet. Add them manually or upload a CSV." : "No candidates match your search."}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {paginatedCandidates.map((c: any) => (
                  <div key={c._id || c.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {(c.name || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{c.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{c.email}</p>
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
                    {c.status === "screened" && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shrink-0 ml-3">
                        Screened — {c.score}/100
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredCandidates.length)} of {filteredCandidates.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)} className="w-8 h-8 p-0">
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}

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
