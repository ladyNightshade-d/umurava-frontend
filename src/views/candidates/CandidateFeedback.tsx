'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import CandidateLayout from "@/src/components/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Brain, CheckCircle2, AlertTriangle, Lightbulb, MessageSquare, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
};

const CandidateFeedback = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Get all feedback for this user
      const { data: fb } = await supabase
        .from("candidate_feedback")
        .select("*, applications(*), jobs(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setFeedbacks(fb ?? []);
      setLoading(false);

      // Auto-select if specific app
      const appId = searchParams.get("app");
      if (appId && fb) {
        const match = fb.find((f: any) => f.application_id === appId);
        if (match) setSelected(match);
      }
    };
    load();
  }, [user, searchParams]);

  const requestFeedback = async (applicationId: string, jobId: string) => {
    if (!user) return;
    setGenerating(applicationId);
    try {
      const { data, error } = await supabase.functions.invoke("candidate-feedback", {
        body: { application_id: applicationId, job_id: jobId, user_id: user.id },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      toast.success("Feedback generated!");
      // Reload
      const { data: fb } = await supabase
        .from("candidate_feedback")
        .select("*, applications(*), jobs(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setFeedbacks(fb ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate feedback");
    } finally {
      setGenerating(null);
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
          <h1 className="text-2xl font-bold">AI Feedback</h1>
          <p className="text-muted-foreground">Detailed AI analysis of your applications — learn what to improve</p>
        </div>

        {feedbacks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Brain className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No feedback yet. Apply to jobs and feedback will appear here once reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {feedbacks.map((fb) => (
              <Card key={fb.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(fb)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-center w-16">
                    <div className={`text-2xl font-bold ${getScoreColor(fb.final_score)}`}>{fb.final_score}</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{fb.jobs?.title || "Job"}</h3>
                    <p className="text-sm text-muted-foreground">{fb.jobs?.department}</p>
                    <Badge variant="outline" className={`mt-1 text-xs ${fb.culture_fit?.toLowerCase().includes("high") ? "text-success" : fb.culture_fit?.toLowerCase().includes("medium") ? "text-warning" : "text-destructive"}`}>
                      {fb.culture_fit} Culture Fit
                    </Badge>
                  </div>
                  <Progress value={fb.final_score} className="w-24 h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle>{selected.jobs?.title || "Job Feedback"}</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(selected.final_score)}`}>{selected.final_score}</div>
                    <div className="text-sm text-muted-foreground">Your Score</div>
                  </div>
                  <div className="flex-1">
                    <Progress value={selected.final_score} className="h-3" />
                  </div>
                  <Badge className={selected.culture_fit?.toLowerCase().includes("high") ? "bg-success text-success-foreground" : selected.culture_fit?.toLowerCase().includes("medium") ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"}>
                    {selected.culture_fit} Fit
                  </Badge>
                </div>

                {/* Status Reason */}
                {selected.status_reason && (
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Decision Explanation
                    </h4>
                    <p className="text-sm text-muted-foreground">{selected.status_reason}</p>
                  </div>
                )}

                {/* Strengths */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />What You Did Well
                  </h4>
                  <ul className="space-y-1">
                    {(selected.strengths || []).map((s: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gaps */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />Areas to Improve
                  </h4>
                  <ul className="space-y-1">
                    {(selected.gaps || []).map((g: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-warning mt-0.5">•</span> {g}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvement Tips */}
                {(selected.improvement_tips || []).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-accent" />How to Improve
                    </h4>
                    <ul className="space-y-2">
                      {selected.improvement_tips.map((tip: string, i: number) => (
                        <li key={i} className="text-sm p-3 rounded-lg bg-accent/5 border border-accent/10">
                          <TrendingUp className="h-3.5 w-3.5 text-accent inline mr-2" />{tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CandidateLayout>
  );
};

export default CandidateFeedback;
