'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { fetchJobs, deleteJob } from "@/src/store/jobsSlice";
import DashboardLayout from "@/src/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import DeleteJobDialog from "@/src/components/DeleteJobDialog";
import {
  Briefcase, Users, ArrowLeft, Calendar, GraduationCap,
  Clock, Trash2, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface JobDetailProps {
  jobId: string;
}

const JobDetail = ({ jobId }: JobDetailProps) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { jobs, loading } = useAppSelector((state) => state.jobs);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (user && jobs.length === 0) dispatch(fetchJobs(user.id));
  }, [user, dispatch, jobs.length]);

  const job = jobs.find((j) => j._id === jobId || j.id === jobId);

  const handleDelete = async () => {
    if (!job || !user) return;
    try {
      await dispatch(deleteJob({ jobId: job._id, userId: user.id })).unwrap();
      toast.success(`"${job.title}" deleted.`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : err?.message || "Failed to delete job");
    }
  };

  if (loading || (!job && jobs.length === 0)) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto text-center py-20 space-y-4">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-lg font-semibold text-foreground">Job not found</p>
          <p className="text-sm text-muted-foreground">This job may have been deleted.</p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate">{job.title}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
            <p className="text-muted-foreground mt-1">{job.department}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link href={`/candidates?job=${job._id}`}>
                <Users className="h-4 w-4 mr-2" />
                View Candidates
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "Experience", value: job.experience || "Not specified" },
            { icon: GraduationCap, label: "Education", value: job.education || "Not specified" },
            { icon: Calendar, label: "Posted", value: job.createdAt ? new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown" },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground truncate">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Description */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {job.description || "No description provided."}
            </p>
          </CardContent>
        </Card>

        {/* Required skills */}
        {job.skills && job.skills.length > 0 && (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild className="flex-1">
            <Link href={`/candidates?job=${job._id}`}>
              <Users className="h-4 w-4 mr-2" />
              Manage Candidates
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/results?job=${job._id}`}>
              Screen with AI →
            </Link>
          </Button>
        </div>
      </div>

      <DeleteJobDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        jobTitle={job.title}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
};

export default JobDetail;
