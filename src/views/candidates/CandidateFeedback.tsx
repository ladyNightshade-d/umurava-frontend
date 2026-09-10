'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import CandidateLayout from "@/src/components/CandidateLayout";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Brain, CheckCircle2, AlertTriangle, Lightbulb, MessageSquare, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
};

const CandidateFeedback = () => {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) return;
    
    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/candidates/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data);
          
          // Auto-select if specific app
          const appId = searchParams.get("app");
          if (appId && data) {
            const match = data.find((f: any) => f.application_id === appId || f.applicationId === appId);
            if (match) setSelected(match);
          }
        }
      } catch (err) {
        console.error("Failed to load feedback:", err);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [user, token, searchParams]);

  const requestFeedback = async (applicationId: string, jobId: string) => {
    if (!user || !token) return;
    setGenerating(applicationId);
    try {
      const res = await fetch(`${BASE_URL}/candidates/feedback/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ application_id: applicationId, job_id: jobId }),
      });
      
      if (!res.ok) throw new Error("Failed to generate feedback");
      
      toast.success("Feedback generated!");
      
      // Reload feedback
      const reloadRes = await fetch(`${BASE_URL}/candidates/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reloadRes.ok) {
        const data = await reloadRes.json();
        setFeedbacks(data);
      }
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
            {feedbacks.map((fb) => {
              const job = fb.job || fb.jobs;
              return (
                <Card key={fb.id || fb._id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(fb)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-center w-16">
                      <div className={`text-2xl font-bold ${getScoreColor(fb.final_score || fb.finalScore)}`}>{fb.final_score || fb.finalScore}</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{job?.title || "Job"}</h3>
                      <p className="text-sm text-muted-foreground">{job?.department}</p>
                      <Badge variant="outline" className={`mt-1 text-xs ${(fb.culture_fit || fb.cultureFit)?.toLowerCase().includes("high") ? "text-success" : (fb.culture_fit || fb.cultureFit)?.toLowerCase().includes("medium") ? "text-warning" : "text-destructive"}`}>
                        {fb.culture_fit || fb.cultureFit} Culture Fit
                      </Badge>
                    </div>
                    <Progress value={fb.final_score || fb.finalScore} className="w-24 h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle>{(selected.job || selected.jobs)?.title || "Job Feedback"}</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(selected.final_score || selected.finalScore)}`}>{selected.final_score || selected.finalScore}</div>
                    <div className="text-sm text-muted-foreground">Your Score</div>
                  </div>
                  <div className="flex-1">
                    <Progress value={selected.final_score || selected.finalScore} className="h-3" />
                  </div>
                  <Badge className={(selected.culture_fit || selected.cultureFit)?.toLowerCase().includes("high") ? "bg-success text-success-foreground" : (selected.culture_fit || selected.cultureFit)?.toLowerCase().includes("medium") ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground"}>
                    {selected.culture_fit || selected.cultureFit} Fit
                  </Badge>
                </div>

                {(selected.status_reason || selected.statusReason) && (
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Decision Explanation
                    </h4>
                    <p className="text-sm text-muted-foreground">{selected.status_reason || selected.statusReason}</p>
                  </div>
                )}

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

                {(selected.improvement_tips || selected.improvementTips || []).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-accent" />How to Improve
                    </h4>
                    <ul className="space-y-2">
                      {(selected.improvement_tips || selected.improvementTips).map((tip: string, i: number) => (
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
