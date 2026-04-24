'use client';

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Shield, Brain, Users, BarChart3, MessageSquare, Sliders } from "lucide-react";
import ThemeToggle from "@/src/components/ThemeToggle";

const features = [
  {
    icon: Brain,
    title: "Cultural DNA Matcher",
    description: "AI analyzes behavioral traits like ownership, adaptability, and collaboration to rank candidates by team fit.",
  },
  {
    icon: Shield,
    title: "Bias Reduction Mode",
    description: "Hide names, gender, and university prestige during scoring. Ensure merit-based, ethical evaluation.",
  },
  {
    icon: MessageSquare,
    title: "AI Interview Generator",
    description: "Get 2–3 targeted interview questions for top candidates, addressing gaps and risks automatically.",
  },
  {
    icon: BarChart3,
    title: '"Why Not" Dashboard',
    description: "Understand exactly why almost-qualified candidates didn't make the shortlist with clear gap analysis.",
  },
  {
    icon: Sliders,
    title: "Human-in-the-Loop Control",
    description: "Adjust weighting between skills, experience, and culture fit. Shortlist updates instantly.",
  },
  {
    icon: Users,
    title: "Skill Highlight Tags",
    description: "AI extracts top skills from resumes and displays them as visual tags for quick evaluation.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">HireWise AI</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth?tab=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 animate-fade-in">
            Hire Smarter.{" "}
            <span className="text-primary">Fairer.</span>{" "}
            Faster.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Predict human potential, reduce bias, and make data-driven hiring decisions with AI that explains its reasoning.
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/auth?tab=signup">Start Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need for smarter hiring
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From cultural fit analysis to bias-free screening, HireWise AI covers the entire recruitment pipeline.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={feature.title} className="border bg-card hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "85%", label: "Faster Screening" },
              { value: "3x", label: "Better Culture Fit" },
              { value: "0", label: "Unconscious Bias" },
              { value: "100%", label: "Explainable AI" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to transform your hiring?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join recruiters who hire based on potential, not just keywords.
          </p>
          <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
            <Link href="/auth?tab=signup">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 HireWise AI. Predicting Human Potential in Recruitment.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
