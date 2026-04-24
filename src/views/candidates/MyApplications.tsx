'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import CandidateLayout from "@/src/components/CandidateLayout";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { FileText, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Under Review", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  reviewed: { label: "Reviewed", color: "bg-info/10 text-info border-info/20", icon: Eye },
  accepted: { label: "Accepted", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  rejected: { label: "Not Selected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("applications")
      .select("*, jobs(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setApplications(data ?? []));
  }, [user]);

  return (
    <CandidateLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track the status of your job applications</p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No applications yet.</p>
              <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/candidate/jobs">Browse Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const status = statusConfig[app.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{app.jobs?.title || "Unknown Job"}</h3>
                      <p className="text-sm text-muted-foreground">{app.jobs?.department} · {app.jobs?.experience_level}</p>
                      <p className="text-xs text-muted-foreground mt-1">Applied {new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`gap-1 ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                      {(app.status === "reviewed" || app.status === "accepted" || app.status === "rejected") && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/candidate/feedback?app=${app.id}`}>View Feedback</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
};

export default MyApplications;
