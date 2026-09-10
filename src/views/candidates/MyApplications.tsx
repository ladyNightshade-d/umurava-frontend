'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import CandidateLayout from "@/src/components/CandidateLayout";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { FileText, Clock, CheckCircle2, XCircle, Eye, Loader2 } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Under Review", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  reviewed: { label: "Reviewed", color: "bg-info/10 text-info border-info/20", icon: Eye },
  accepted: { label: "Accepted", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  rejected: { label: "Not Selected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const MyApplications = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;
    
    const loadApplications = async () => {
      try {
        const res = await fetch(`${BASE_URL}/candidates/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (err) {
        console.error("Failed to load applications:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadApplications();
  }, [user, token]);

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
              const job = app.job || app.jobs;
              return (
                <Card key={app.id || app._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{job?.title || "Unknown Job"}</h3>
                      <p className="text-sm text-muted-foreground">{job?.department} · {job?.experience_level || job?.experience}</p>
                      <p className="text-xs text-muted-foreground mt-1">Applied {new Date(app.created_at || app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`gap-1 ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                      {(app.status === "reviewed" || app.status === "accepted" || app.status === "rejected") && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/candidate/feedback?app=${app.id || app._id}`}>View Feedback</Link>
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
