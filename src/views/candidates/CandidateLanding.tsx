'use client';

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Brain, Search, MessageSquare, TrendingUp, Star, Lightbulb } from "lucide-react";
import ThemeToggle from "@/src/components/ThemeToggle";

const features = [
  { icon: Search, title: "Browse Open Positions", description: "Explore jobs that match your skills and experience across top companies." },
  { icon: Brain, title: "AI-Powered Matching", description: "Our AI evaluates your fit and gives you a compatibility score for each role." },
  { icon: MessageSquare, title: "Personalized Feedback", description: "Get detailed feedback on your application — what you excelled at and where to improve." },
  { icon: TrendingUp, title: "Track Your Applications", description: "Monitor the status of all your applications in one clean dashboard." },
  { icon: Lightbulb, title: "Improvement Tips", description: "Receive actionable tips to strengthen your profile for future opportunities." },
  { icon: Star, title: "Skill Gap Analysis", description: "See exactly which skills you need to develop to land your dream role." },
];

const CandidateLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Brain className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">HireWise <span className="text-accent">Candidate</span></span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/">For Recruiters</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/candidate/auth">Sign In</Link>
            </Button>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/candidate/auth?tab=signup">Join Now</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Star className="h-4 w-4" />
            AI-Powered Career Platform
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
            Know <span className="text-accent">Why.</span> Grow{" "}
            <span className="text-primary">How.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Apply to jobs, get AI-powered feedback on every application, and discover exactly what to improve to land your dream role.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <Link href="/candidate/auth?tab=signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/candidate/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Your career growth, powered by AI</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Stop guessing why you didn't get the job. Get transparent, actionable feedback on every application.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-accent-foreground mb-4">Ready to level up your career?</h2>
          <p className="text-accent-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of candidates who use AI feedback to improve and land better jobs.
          </p>
          <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
            <Link href="/candidate/auth?tab=signup">Create Free Account</Link>
          </Button>
        </div>
      </section>

      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 HireWise AI. Empowering Candidates with Transparent Feedback.
        </div>
      </footer>
    </div>
  );
};

export default CandidateLanding;
