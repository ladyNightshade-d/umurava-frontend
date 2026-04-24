'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/src/store";
import { createJob } from "@/src/store/jobsSlice";
import DashboardLayout from "@/src/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Slider } from "@/src/components/ui/slider";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

const steps = [
  { label: "Job Details", description: "Title, department, and requirements" },
  { label: "Cultural DNA", description: "Define your ideal top performer" },
  { label: "Scoring Weights", description: "Prioritize what matters most" },
];

const CreateJob = () => {
  const { user } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.jobs);
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    department: "",
    description: "",
    required_skills: "",
    experience_level: "",
    top_performer_profile: "",
    weight_skills: 40,
    weight_experience: 30,
    weight_culture: 30,
  });

  const updateWeight = (field: string, value: number) => {
    const remaining = 100 - value;
    const others = ["weight_skills", "weight_experience", "weight_culture"].filter((k) => k !== field);
    const currentOtherTotal = (form as any)[others[0]] + (form as any)[others[1]];
    const ratio0 = currentOtherTotal > 0 ? (form as any)[others[0]] / currentOtherTotal : 0.5;
    setForm({
      ...form,
      [field]: value,
      [others[0]]: Math.round(remaining * ratio0),
      [others[1]]: remaining - Math.round(remaining * ratio0),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await dispatch(createJob({
        user_id: user.id,
        title: form.title,
        department: form.department,
        description: form.description,
        required_skills: form.required_skills.split(",").map((s) => s.trim()).filter(Boolean),
        experience_level: form.experience_level,
        top_performer_profile: form.top_performer_profile,
        weight_skills: form.weight_skills,
        weight_experience: form.weight_experience,
        weight_culture: form.weight_culture,
      })).unwrap();
      toast.success("Job created!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err || "Failed to create job");
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return form.title && form.department && form.description && form.required_skills && form.experience_level;
    return true;
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Create Job Posting</h1>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => i <= currentStep && setCurrentStep(i)}
                className={cn(
                  "flex items-center gap-2 text-left transition-colors",
                  i <= currentStep ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all",
                  i < currentStep ? "bg-score-high text-score-high-foreground" :
                    i === currentStep ? "bg-primary text-primary-foreground" :
                      "bg-muted text-muted-foreground"
                )}>
                  {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <div className="hidden sm:block">
                  <p className={cn("text-xs font-semibold", i <= currentStep ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </button>
              {i < steps.length - 1 && (
                <div className={cn("flex-1 h-px", i < currentStep ? "bg-score-high" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Job Details */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior Full-Stack Engineer" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Engineering" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Job Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the role, responsibilities, and expectations..." rows={4} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Required Skills (comma-separated)</Label>
                    <Input value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} placeholder="React, TypeScript, Node.js" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Input value={form.experience_level} onChange={(e) => setForm({ ...form, experience_level: e.target.value })} placeholder="Senior (5+ years)" required />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Cultural DNA */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cultural DNA Profile</CardTitle>
                <CardDescription>Describe your ideal top performer to help AI assess culture fit</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea value={form.top_performer_profile} onChange={(e) => setForm({ ...form, top_performer_profile: e.target.value })} placeholder="Our top performers are proactive problem-solvers who take ownership..." rows={5} />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Scoring Weights */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scoring Weights</CardTitle>
                <CardDescription>Adjust how much each factor influences the final ranking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: "weight_skills", label: "Skills Match" },
                  { key: "weight_experience", label: "Experience" },
                  { key: "weight_culture", label: "Culture Fit" },
                ].map((w) => (
                  <div key={w.key} className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <Label>{w.label}</Label>
                      <span className="font-semibold text-primary">{(form as any)[w.key]}%</span>
                    </div>
                    <Slider value={[(form as any)[w.key]]} onValueChange={([v]) => updateWeight(w.key, v)} max={100} step={5} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 justify-between">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Job
              </Button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateJob;
