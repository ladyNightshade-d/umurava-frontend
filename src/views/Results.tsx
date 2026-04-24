'use client';

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { fetchJobs, setSelectedJob } from "@/src/store/jobsSlice";
import { fetchCandidates } from "@/src/store/candidatesSlice";
import { fetchResults, screenCandidates as screenCandidatesAction, setSortBy, setBiasMode } from "@/src/store/resultsSlice";
import DashboardLayout from "@/src/components/DashboardLayout";
import ScoreRing from "@/src/components/ScoreRing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Slider } from "@/src/components/ui/slider";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/src/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Loader2, Shield, Brain, ChevronDown, ChevronUp, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ScreeningResult {
    id: string;
    candidate_id: string;
    job_id: string;
    user_id: string;
    final_score: number;
    strengths: string[];
    gaps: string[];
    culture_fit: string;
    skill_tags: string[];
    interview_questions: string[];
    candidate?: any;
}

const getCultureBadge = (fit: string) => {
    const lower = fit?.toLowerCase() || "";
    if (lower.includes("high")) return { label: "High Fit", className: "bg-score-high/15 text-score-high border-score-high/30" };
    if (lower.includes("medium")) return { label: "Medium Fit", className: "bg-tag-highlight/15 text-tag-highlight border-tag-highlight/30" };
    return { label: "Low Fit", className: "bg-score-low/15 text-score-low border-score-low/30" };
};

const getTagColor = (tag: string, isHighlight: boolean) => {
    if (isHighlight) return "bg-tag-highlight/10 text-tag-highlight border-tag-highlight/20";
    return "bg-tag-technical/10 text-tag-technical border-tag-technical/20";
};

const BreakdownBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="space-y-1.5">
        <span className="text-[11px] text-muted-foreground block">{label}</span>
        <div className="h-1.5 w-full rounded-full bg-muted/50">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%`, transition: "width 0.5s ease" }} />
        </div>
        <span className="text-xs font-semibold text-foreground block">{value}%</span>
    </div>
);

const CandidateCard = ({
    result,
    rank,
    biasMode,
    weights,
    onSelect,
}: {
    result: ScreeningResult;
    rank: number;
    biasMode: boolean;
    weights: { skills: number; experience: number; culture: number };
    onSelect: () => void;
}) => {
    const [questionsOpen, setQuestionsOpen] = useState(false);
    const name = biasMode ? `Candidate ${String.fromCharCode(64 + rank)}` : (result.candidate?.name || "Unknown");
    const badge = getCultureBadge(result.culture_fit);

    const skillScore = Math.min(100, Math.round(result.final_score * (weights.skills / 40) * (0.85 + Math.random() * 0.3)));
    const expScore = Math.min(100, Math.round(result.final_score * (weights.experience / 30) * (0.8 + Math.random() * 0.4)));
    const cultureScore = Math.min(100, Math.round(result.final_score * (weights.culture / 30) * (0.75 + Math.random() * 0.5)));

    return (
        <Card className="border-border/60 hover:border-primary/30 transition-all">
            <CardContent className="p-6">
                <div className="flex items-start gap-5">
                    <div className="text-lg font-bold text-muted-foreground/50 w-6 text-center pt-2 shrink-0">
                        {rank}
                    </div>
                    <div className="shrink-0">
                        <ScoreRing score={result.final_score} size={72} strokeWidth={5} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-semibold text-foreground text-base">{name}</span>
                            <Badge variant="outline" className={`text-xs font-medium ${badge.className}`}>
                                {badge.label}
                            </Badge>
                            {!biasMode && result.candidate?.email && (
                                <span className="text-xs text-muted-foreground">· {result.candidate.email}</span>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-6 max-w-sm">
                            <BreakdownBar label="Skills" value={Math.min(skillScore, 100)} color="bg-tag-technical" />
                            <BreakdownBar label="Experience" value={Math.min(expScore, 100)} color="bg-score-high" />
                            <BreakdownBar label="Culture" value={Math.min(cultureScore, 100)} color="bg-primary" />
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                            {(result.skill_tags || []).slice(0, 3).map((tag, i) => (
                                <Badge key={tag} variant="outline" className={`text-xs ${getTagColor(tag, i === 0)}`}>{tag}</Badge>
                            ))}
                            {(result.skill_tags || []).length > 3 && (
                                <Badge variant="outline" className="text-xs text-muted-foreground">+{result.skill_tags.length - 3}</Badge>
                            )}
                        </div>
                        {(result.gaps || []).length > 0 && (
                            <div className="space-y-1">
                                {(result.gaps || []).slice(0, 2).map((gap, i) => (
                                    <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                                        <span className="text-tag-highlight mt-0.5 shrink-0">•</span>{gap}
                                    </p>
                                ))}
                                {(result.gaps || []).length > 2 && (
                                    <button className="text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
                                        +{result.gaps.length - 2} more
                                    </button>
                                )}
                            </div>
                        )}
                        {(result.interview_questions || []).length > 0 && (
                            <Collapsible open={questionsOpen} onOpenChange={setQuestionsOpen}>
                                <CollapsibleTrigger asChild>
                                    <button className="w-full flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-foreground transition-colors pt-2 border-t border-border/40">
                                        <MessageSquare className="h-3 w-3" />
                                        <span>{result.interview_questions.length} Interview Questions</span>
                                        {questionsOpen ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
                                    </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2 space-y-1.5">
                                    {result.interview_questions.map((q, i) => (
                                        <p key={i} className="text-sm p-2.5 rounded-md bg-muted/50 border border-border/50 text-muted-foreground">{q}</p>
                                    ))}
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={onSelect} className="shrink-0 text-muted-foreground hover:text-primary">
                        Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const Results = () => {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const { jobs, selectedJobId } = useAppSelector((state) => state.jobs);
    const { candidates } = useAppSelector((state) => state.candidates);
    const { results, screening, sortBy, biasMode } = useAppSelector((state) => state.results);
    const [selectedCandidate, setSelectedCandidate] = useState<ScreeningResult | null>(null);
    const [weights, setWeights] = useState({ skills: 40, experience: 30, culture: 30 });

    useEffect(() => {
        if (user) {
            dispatch(fetchJobs(user.id));
        }
    }, [user, dispatch]);

    useEffect(() => {
        const jobFromUrl = searchParams.get("job");
        if (jobFromUrl) {
            dispatch(setSelectedJob(jobFromUrl));
        } else if (!selectedJobId && jobs.length > 0) {
            dispatch(setSelectedJob(jobs[0].id));
        }
    }, [searchParams, jobs, selectedJobId, dispatch]);

    useEffect(() => {
        if (user && selectedJobId) {
            dispatch(fetchCandidates({ userId: user.id, jobId: selectedJobId }));
            dispatch(fetchResults({ userId: user.id, jobId: selectedJobId, candidates }));
        }
    }, [user, selectedJobId, dispatch]);

    useEffect(() => {
        if (selectedJobId) {
            const job = jobs.find((j) => j.id === selectedJobId);
            if (job) {
                setWeights({
                    skills: job.weight_skills || 40,
                    experience: job.weight_experience || 30,
                    culture: job.weight_culture || 30,
                });
            }
        }
    }, [selectedJobId, jobs]);

    const handleScreenCandidates = async () => {
        if (!user || !selectedJobId) return;
        const job = jobs.find((j) => j.id === selectedJobId);
        if (!job) {
            toast.error("Job not found");
            return;
        }
        try {
            await dispatch(screenCandidatesAction({
                jobId: selectedJobId,
                userId: user.id,
                job,
                candidates,
                weights,
            })).unwrap();
            toast.success("Screening complete!");
        } catch (err: any) {
            if (err.includes?.("Rate limit")) {
                toast.error("AI rate limited. Please try again in a moment.");
            } else if (err.includes?.("Payment")) {
                toast.error("AI credits exhausted.");
            } else {
                toast.error(err || "Screening failed");
            }
        }
    };

    const sortedResults = useMemo(() => {
        return [...results].sort((a, b) => {
            if (sortBy === "score") return b.final_score - a.final_score;
            const fitOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
            return (fitOrder[b.culture_fit?.toLowerCase()] || 0) - (fitOrder[a.culture_fit?.toLowerCase()] || 0);
        });
    }, [results, sortBy]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Screening Results</h1>
                        <p className="text-sm text-muted-foreground mt-1">AI-powered candidate analysis and ranking</p>
                    </div>
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="p-3 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-primary" />
                            </div>
                            <div className="mr-3">
                                <p className="text-sm font-semibold text-foreground">Bias Reduction</p>
                                <p className="text-xs text-muted-foreground">Hide identifying info</p>
                            </div>
                            <Switch id="bias" checked={biasMode} onCheckedChange={(checked) => dispatch(setBiasMode(checked))} />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-4 flex-wrap items-end">
                    <div className="w-72">
                        <Label className="mb-2 block text-sm">Select Job</Label>
                        <Select value={selectedJobId || ""} onValueChange={(value) => dispatch(setSelectedJob(value))}>
                            <SelectTrigger><SelectValue placeholder="Choose a job..." /></SelectTrigger>
                            <SelectContent>
                                {jobs.map((job) => (
                                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleScreenCandidates} disabled={screening || candidates.length === 0} className="shadow-sm">
                        {screening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                        {screening ? "Screening..." : "Screen with AI"}
                    </Button>
                </div>

                {results.length > 0 && (
                    <Card className="border-border/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Scoring Weights</CardTitle>
                            <CardDescription>Adjust and re-screen to update rankings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { key: "skills", label: "Skills" },
                                    { key: "experience", label: "Experience" },
                                    { key: "culture", label: "Culture Fit" },
                                ].map((w) => (
                                    <div key={w.key} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <Label>{w.label}</Label>
                                            <span className="font-semibold text-primary">{(weights as any)[w.key]}%</span>
                                        </div>
                                        <Slider value={[(weights as any)[w.key]]} max={100} step={5} onValueChange={([v]) => {
                                            const others = ["skills", "experience", "culture"].filter((k) => k !== w.key);
                                            const rem = 100 - v;
                                            const ratio = (weights as any)[others[0]] / ((weights as any)[others[0]] + (weights as any)[others[1]] || 1);
                                            setWeights({ ...weights, [w.key]: v, [others[0]]: Math.round(rem * ratio), [others[1]]: rem - Math.round(rem * ratio) });
                                        }} />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {results.length > 0 && (
                    <div className="flex gap-2">
                        <Button variant={sortBy === "score" ? "default" : "outline"} size="sm" onClick={() => dispatch(setSortBy("score"))}>Sort by Score</Button>
                        <Button variant={sortBy === "culture" ? "default" : "outline"} size="sm" onClick={() => dispatch(setSortBy("culture"))}>Sort by Culture Fit</Button>
                    </div>
                )}

                {sortedResults.length > 0 ? (
                    <div className="space-y-4">
                        {sortedResults.map((result, idx) => (
                            <CandidateCard
                                key={result.id}
                                result={result}
                                rank={idx + 1}
                                biasMode={biasMode}
                                weights={weights}
                                onSelect={() => setSelectedCandidate(result)}
                            />
                        ))}
                    </div>
                ) : candidates.length > 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <Brain className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>No screening results yet. Click "Screen with AI" to analyze candidates.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <p>No candidates for this job. Add candidates first.</p>
                        </CardContent>
                    </Card>
                )}

                <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        {selectedCandidate && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-3">
                                        <span>{biasMode ? `Candidate ${String.fromCharCode(65 + sortedResults.findIndex(r => r.id === selectedCandidate.id))}` : selectedCandidate.candidate?.name}</span>
                                        <Badge variant="outline" className={getCultureBadge(selectedCandidate.culture_fit).className}>
                                            {getCultureBadge(selectedCandidate.culture_fit).label}
                                        </Badge>
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="flex items-center gap-6 p-5 rounded-lg bg-muted/30 border border-border/50">
                                    <ScoreRing score={selectedCandidate.final_score} size={96} strokeWidth={6} />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-foreground">Overall Score</p>
                                        <p className="text-xs text-muted-foreground">Based on skills, experience, and cultural alignment</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2 text-sm text-foreground">Skills</h4>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {(selectedCandidate.skill_tags || []).map((tag) => (
                                            <Badge key={tag} variant="outline" className={getTagColor(tag, false)}>{tag}</Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2 text-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-score-high" />Strengths
                                    </h4>
                                    <ul className="space-y-1">
                                        {(selectedCandidate.strengths || []).map((s, i) => (
                                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                <span className="text-score-high mt-0.5">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2 text-foreground">
                                        <AlertTriangle className="h-4 w-4 text-warning" />
                                        {selectedCandidate.final_score < 60 ? 'Why Not Shortlisted' : 'Areas for Growth'}
                                    </h4>
                                    <ul className="space-y-1">
                                        {(selectedCandidate.gaps || []).map((g, i) => (
                                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                <span className="text-warning mt-0.5">•</span> {g}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2 text-foreground">
                                        <MessageSquare className="h-4 w-4 text-primary" />Suggested Interview Questions
                                    </h4>
                                    <ul className="space-y-2">
                                        {(selectedCandidate.interview_questions || []).map((q, i) => (
                                            <li key={i} className="text-sm p-3 rounded-lg bg-muted/50 border border-border/50">{q}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default Results;
