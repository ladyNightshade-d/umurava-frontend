'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { fetchJobs, deleteJob } from "@/src/store/jobsSlice";
import DashboardLayout from "@/src/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Briefcase, Users, BarChart3, Plus, Upload, Eye,
  CheckCircle2, Clock, ArrowUpRight, Trash2,
} from "lucide-react";
import DeleteJobDialog from "@/src/components/DeleteJobDialog";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Sparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 1);
  const h = 28, w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-40">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};

const GhostCard = ({ step, title, description, icon: Icon, href }: {
  step: number; title: string; description: string; icon: React.ElementType; href: string;
}) => (
  <Link href={href} className="group block">
    <div className="rounded-md border border-dashed border-silver p-5 hover:border-primary/40 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 shrink-0 rounded-full bg-burgundy/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Step {step}</p>
          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  </Link>
);

const ActivityItem = ({ label, time, done }: { label: string; time?: string; done?: boolean }) => (
  <div className="flex items-start gap-3 py-2.5">
    {done ? <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> : <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
    <div className="flex-1 min-w-0">
      <p className="text-sm text-foreground leading-tight">{label}</p>
      {time && <p className="text-xs text-muted-foreground mt-0.5">{time}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user, token } = useAuth();
  const dispatch = useAppDispatch();
  const { jobs } = useAppSelector((state) => state.jobs);
  const [stats, setStats] = useState({ jobs: 0, candidates: 0, screenings: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (user) dispatch(fetchJobs(user.id));
  }, [user, dispatch]);

  useEffect(() => {
    if (!token || jobs.length === 0) {
      setStats(s => ({ ...s, jobs: jobs.length }));
      setStatsLoading(false);
      return;
    }
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const jobIds = jobs.map((j: any) => j._id);
        let totalCandidates = 0;
        let totalScreenings = 0;
        await Promise.all(jobIds.map(async (jobId: string) => {
          const res = await fetch(`${BASE_URL}/jobs/${jobId}/applicants`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          totalCandidates += data.total || 0;
          totalScreenings += (data.data || []).filter((a: any) => a.status === 'screened').length;
        }));
        setStats({ jobs: jobs.length, candidates: totalCandidates, screenings: totalScreenings });
      } catch (err) {
        setStats(s => ({ ...s, jobs: jobs.length }));
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, [token, jobs]);

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
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Welcome back, {user?.name || "Recruiter"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Overview of your recruitment funnel today.</p>
            </div>
            <Button size="sm" className="shadow-sm hover:-translate-y-0.5 transition-transform">
              <Link href="/jobs/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create Job
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Active Jobs", value: stats.jobs, icon: Briefcase, spark: [0, 1, 1, 2, 2, 3, stats.jobs] },
              { label: "Total Candidates", value: stats.candidates, icon: Users, spark: [0, 2, 3, 5, 4, 6, stats.candidates] },
              { label: "Screenings Complete", value: stats.screenings, icon: BarChart3, spark: [0, 0, 1, 1, 2, 2, stats.screenings] },
            ].map((s) => (
              <Card key={s.label} className="shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] border-silver/60">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-burgundy/10 flex items-center justify-center">
                      <s.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      {statsLoading ? (
                        <>
                          <Skeleton className="h-7 w-10 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </>
                      ) : (
                        <>
                          <p className="text-2xl font-bold leading-none text-foreground">{s.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {statsLoading ? <Skeleton className="h-7 w-20" /> : <Sparkline data={s.spark} />}
                </CardContent>
              </Card>
            ))}
          </div>

          {!hasData ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Getting Started</h2>
              <div className="grid gap-3">
                <GhostCard step={1} title="Create Your First Job" description="Define the role, required skills, and what great looks like." icon={Briefcase} href="/jobs/new" />
                <GhostCard step={2} title="Upload Candidates" description="Add resumes and candidate profiles for AI screening." icon={Upload} href="/candidates" />
                <GhostCard step={3} title="View Insights" description="Review AI-powered screening results and ranked candidates." icon={Eye} href="/results" />
              </div>
            </div>
          ) : (
            <Card className="shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] border-silver/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground">Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-silver/60">
                  {recentJobs.map((job: any) => (
                    <div key={job._id} className="flex items-center justify-between py-3 group">
                      <Link href={`/candidates?job=${job._id}`} className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{job.title}</p>
                        <p className="text-xs text-muted-foreground">{job.department}</p>
                      </Link>
                      <div className="flex items-center gap-1 shrink-0 ml-3">
                        <button
                          onClick={() => setDeleteTarget({ id: job._id, title: job.title })}
                          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <Link href={`/candidates?job=${job._id}`}>
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

        <aside className="hidden lg:block w-72 shrink-0 space-y-5">
          <Card className="shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] border-silver/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">System Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-silver/60">
                <ActivityItem label={`${stats.jobs} job${stats.jobs !== 1 ? 's' : ''} created`} done={stats.jobs > 0} />
                <ActivityItem label={`${stats.candidates} candidate${stats.candidates !== 1 ? 's' : ''} uploaded`} done={stats.candidates > 0} />
                <ActivityItem label={`${stats.screenings} screening${stats.screenings !== 1 ? 's' : ''} completed`} done={stats.screenings > 0} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[0_1px_3px_0_rgb(0_0_0/0.04)] border-silver/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Funnel Summary</CardTitle>
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