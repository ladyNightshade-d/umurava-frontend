'use client';

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { fetchJobs, setSelectedJob } from "@/src/store/jobsSlice";
import { fetchCandidates } from "@/src/store/candidatesSlice";
import { fetchResults, screenCandidates as screenCandidatesAction, setSortBy, setBiasMode, setWeights } from "@/src/store/resultsSlice";
import DashboardLayout from "@/src/components/DashboardLayout";
import ScoreRing from "@/src/components/ScoreRing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Slider } from "@/src/components/ui/slider";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Loader2, Shield, Brain, AlertTriangle, CheckCircle2, MessageSquare, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

interface ScreeningResult {
    id: string;
    _id: string;
    candidate_id: string;
    job_id: string;
    final_score: number;
    strengths: string[];
    gaps: string[];
    culture_fit: string;
    skill_tags: string[];
    interview_questions: string[];
    recommendation: string;
    candidate?: any;
}

const getCultureBadge = (fit: string) => {
    const lower = fit?.toLowerCase() || "";
    if (lower.includes("high")) return { label: "High Fit", className: "bg-green-500/15 text-green-600 border-green-500/30" };
    if (lower.includes("medium")) return { label: "Medium Fit", className: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" };
    return { label: "Low Fit", className: "bg-red-500/15 text-red-600 border-red-500/30" };
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

const CandidateCard = ({ result, rank, biasMode, onSelect }: {
    result: ScreeningResult; rank: number; biasMode: boolean; onSelect: () => void;
}) => {
    const name = biasMode ? `Candidate ${String.fromCharCode(64 + rank)}` : (result.candidate?.name || "Unknown");
    const badge = getCultureBadge(result.culture_fit);

    return (
        <Card className="border-border/60 hover:border-primary/30 transition-all">
            <CardContent className="p-6">
                <div className="flex items-start gap-5">
                    <div className="text-lg font-bold text-muted-foreground/50 w-6 text-center pt-2 shrink-0">{rank}</div>
                    <div className="shrink-0">
                        <ScoreRing score={result.final_score} size={72} strokeWidth={5} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-semibold text-foreground text-base">{name}</span>
                            <Badge variant="outline" className={`text-xs font-medium ${badge.className}`}>{badge.label}</Badge>
                            {!biasMode && result.candidate?.email && (
                                <span className="text-xs text-muted-foreground">· {result.candidate.email}</span>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-6 max-w-sm">
                            <BreakdownBar label="Skills" value={result.skill_score} color="bg-blue-500" />
                            <BreakdownBar label="Experience" value={result.experience_score} color="bg-green-500" />
                            <BreakdownBar label="Culture" value={result.culture_score} color="bg-primary" />
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                            {(result.skill_tags || []).slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                        </div>
                        {(result.strengths || []).length > 0 && (
                            <div className="space-y-1">
                                {(result.strengths || []).slice(0, 2).map((s, i) => (
                                    <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                                        <span className="text-green-500 mt-0.5 shrink-0">✓</span>{s}
                                    </p>
                                ))}
                            </div>
                        )}
                        {result.recommendation && (
                            <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">
                                {result.recommendation.slice(0, 120)}...
                            </p>
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
    const { results, screening, sortBy, biasMode, weights } = useAppSelector((state) => state.results);
    const [selectedCandidate, setSelectedCandidate] = useState<ScreeningResult | null>(null);
    const [showWeights, setShowWeights] = useState(false);

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
            dispatch(fetchResults({ userId: user.id, jobId: selectedJobId, candidates }));
        }
    }, [user, selectedJobId, dispatch]);

    const handleScreenCandidates = async () => {
        if (!user || !selectedJobId) return;
        const job = (jobs as any[]).find((j) => (j._id || j.id) === selectedJobId);
        if (!job) { toast.error("Job not found"); return; }
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
            toast.error(err || "Screening failed");
        }
    };

    const totalWeight = weights.skills + weights.experience + weights.culture;

    const handleWeightChange = (key: "skills" | "experience" | "culture", value: number) => {
        dispatch(setWeights({ ...weights, [key]: value }));
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
                                {(jobs as any[]).map((job) => (
                                    <SelectItem key={job._id || job.id} value={job._id || job.id}>{job.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleScreenCandidates} disabled={screening || candidates.length === 0} className="shadow-sm">
                        {screening ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                        {screening ? "Screening..." : "Screen with AI"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowWeights(!showWeights)} className="gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Scoring Weights
                        {totalWeight !== 100 && (
                            <Badge variant="destructive" className="text-xs ml-1">≠ 100%</Badge>
                        )}
                    </Button>
                    {results.length > 0 && (
                        <div className="flex gap-2">
                            <Button variant={sortBy === "score" ? "default" : "outline"} size="sm" onClick={() => dispatch(setSortBy("score"))}>Sort by Score</Button>
                            <Button variant={sortBy === "culture" ? "default" : "outline"} size="sm" onClick={() => dispatch(setSortBy("culture"))}>Sort by Culture Fit</Button>
                        </div>
                    )}
                </div>

                {/* Weight sliders panel */}
                {showWeights && (
                    <Card className="border-primary/20 bg-muted/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4 text-primary" />
                                Scoring Weights
                                <span className={`ml-auto text-xs font-normal ${totalWeight !== 100 ? "text-destructive" : "text-green-600"}`}>
                                    Total: {totalWeight}% {totalWeight !== 100 ? "(should equal 100%)" : "✓"}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-0">
                            {[
                                { key: "skills" as const, label: "Skills Match", color: "text-blue-500" },
                                { key: "experience" as const, label: "Experience", color: "text-green-500" },
                                { key: "culture" as const, label: "Culture Fit", color: "text-primary" },
                            ].map(({ key, label, color }) => (
                                <div key={key} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className={`text-sm font-medium ${color}`}>{label}</Label>
                                        <span className="text-sm font-bold text-foreground">{weights[key]}%</span>
                                    </div>
                                    <Slider
                                        value={[weights[key]]}
                                        onValueChange={([val]) => handleWeightChange(key, val)}
                                        min={0}
                                        max={100}
                                        step={5}
                                        className="w-full"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {sortedResults.length > 0 ? (
                    <div className="space-y-4">
                        {sortedResults.map((result, idx) => (
                            <CandidateCard key={result.id} result={result} rank={idx + 1} biasMode={biasMode} onSelect={() => setSelectedCandidate(result)} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <Brain className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>No screening results yet. Click "Screen with AI" to analyze candidates.</p>
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

                                {/* Score overview */}
                                <div className="flex items-center gap-6 p-5 rounded-lg bg-muted/30 border border-border/50">
                                    <ScoreRing score={selectedCandidate.final_score} size={96} strokeWidth={6} />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-foreground">Overall Score: {selectedCandidate.final_score}/100</p>
                                        <p className="text-xs text-muted-foreground">{selectedCandidate.recommendation}</p>
                                    </div>
                                </div>

                                {/* Sub-score breakdown */}
                                <div className="grid grid-cols-3 gap-4">
                                    <BreakdownBar label="Skills" value={selectedCandidate.skill_score} color="bg-blue-500" />
                                    <BreakdownBar label="Experience" value={selectedCandidate.experience_score} color="bg-green-500" />
                                    <BreakdownBar label="Culture" value={selectedCandidate.culture_score} color="bg-primary" />
                                </div>

                                {/* Strengths */}
                                <div>
                                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2 text-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />Strengths
                                    </h4>
                                    <ul className="space-y-1">
                                        {(selectedCandidate.strengths || []).map((s, i) => (
                                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                <span className="text-green-500 mt-0.5">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Gaps */}
                                <div>
                                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2 text-foreground">
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />Gaps
                                    </h4>
                                    <ul className="space-y-1">
                                        {(selectedCandidate.gaps || []).map((g, i) => (
                                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                <span className="text-yellow-500 mt-0.5">•</span> {g}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Interview questions */}
                                {(selectedCandidate.interview_questions || []).length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-2 text-sm flex items-center gap-2 text-foreground">
                                            <MessageSquare className="h-4 w-4 text-primary" />Suggested Interview Questions
                                        </h4>
                                        <ol className="space-y-2">
                                            {selectedCandidate.interview_questions.map((q, i) => (
                                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                    <span className="font-semibold text-primary shrink-0">{i + 1}.</span> {q}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default Results;