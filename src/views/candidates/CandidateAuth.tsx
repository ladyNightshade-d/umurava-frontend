'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CandidateAuth = () => {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("tab") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Check role and redirect accordingly
      supabase.from("profiles").select("role").eq("user_id", user.id).single().then(({ data }) => {
        if (data?.role === "candidate") router.push("/candidate/jobs");
        else router.push("/dashboard");
      });
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, role: "candidate" },
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/candidate/jobs" : "/candidate/jobs",
          },
        });
        if (error) throw error;

        toast.success("Account created! You can sign in now.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Brain className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold">HireWise <span className="text-accent">Candidate</span></span>
          </div>
          <CardTitle>{isSignUp ? "Create Your Profile" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Start applying and get AI-powered feedback" : "Sign in to view your applications and feedback"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button className="text-accent hover:underline font-medium" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
          <div className="mt-3 text-center">
            <a href="/" className="text-xs text-muted-foreground hover:underline">Are you a recruiter? →</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateAuth;
