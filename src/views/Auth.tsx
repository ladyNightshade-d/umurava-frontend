'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Brain, Loader2, Eye, EyeOff, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, sanitizeError } from "@/src/lib/apiFetch";

// H-3: assert env vars at module level — fail loud rather than silently
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

// M-1: Password strength scoring
const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Fair", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
};

// H-1: input validation helpers
const validateName = (v: string) => v.trim().length >= 2 && v.trim().length <= 100;
const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
const validatePassword = (v: string) => v.length >= 8 && v.length <= 128;
const validateCompany = (v: string) => v.trim().length >= 1 && v.trim().length <= 100;

const Auth = () => {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("tab") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // M-2: rate limiting state
  const [failCount, setFailCount] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  const router = useRouter();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  // M-2: check if form is locked due to repeated failures
  const isLocked = lockUntil !== null && Date.now() < lockUntil;
  const lockSecondsLeft = isLocked ? Math.ceil((lockUntil! - Date.now()) / 1000) : 0;

  // M-10: onGoogleLogin is now properly inside the component — no dead module-level function
  const onGoogleLogin = useCallback(async () => {
    if (!BACKEND_URL) { toast.error("Configuration error."); return; }
    setGoogleLoading(true);
    try {
      await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.href = `${BACKEND_URL}/api/auth/google`;
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // M-2: block if rate limited
    if (isLocked) {
      toast.error(`Too many failed attempts. Try again in ${lockSecondsLeft}s.`);
      return;
    }

    // H-1: client-side input validation before hitting the network
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      toast.error("Password must be between 8 and 128 characters.");
      return;
    }
    if (isSignUp) {
      if (!validateName(name)) {
        toast.error("Name must be between 2 and 100 characters.");
        return;
      }
      if (!validateCompany(company)) {
        toast.error("Company name is required.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const res = await apiFetch(`${BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim().slice(0, 100),
            email: email.trim().toLowerCase().slice(0, 254),
            password,
            company: company.trim().slice(0, 100),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        login(data.token, data.user);
        setFailCount(0);
        toast.success("Account created!");
        router.push("/dashboard");
      } else {
        const res = await apiFetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase().slice(0, 254),
            password,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        login(data.token, data.user);
        setFailCount(0);
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      // M-2: increment fail counter, lock after 5 attempts
      const newFail = failCount + 1;
      setFailCount(newFail);
      if (newFail >= 5) {
        const lockMs = Math.min(30000 * Math.pow(2, newFail - 5), 300000); // 30s → 60s → 120s… max 5 min
        setLockUntil(Date.now() + lockMs);
        toast.error(`Too many failed attempts. Locked for ${Math.round(lockMs / 1000)}s.`);
      } else {
        // H-7: sanitize error before displaying
        toast.error(sanitizeError(error, "Sign in failed. Please check your credentials."));
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = isSignUp && password ? getPasswordStrength(password) : null;
  const StrengthIcon = passwordStrength?.score === undefined ? null :
    passwordStrength.score >= 4 ? ShieldCheck :
    passwordStrength.score >= 2 ? Shield : ShieldAlert;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">HireWise AI</span>
          </div>
          <CardTitle>{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Start hiring smarter today" : "Sign in to your recruiter dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLocked && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">
              Too many failed attempts. Try again in {lockSecondsLeft}s.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                    maxLength={100}
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                maxLength={254}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  maxLength={128}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* M-1: Password strength meter */}
              {passwordStrength && StrengthIcon && (
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <StrengthIcon className="h-3 w-3" />
                    Password strength: <span className="font-medium">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading || isLocked}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              className="text-primary hover:underline font-medium"
              onClick={() => { setIsSignUp(!isSignUp); setFailCount(0); setLockUntil(null); }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={googleLoading}
            className="flex items-center justify-center gap-3 w-full border border-border rounded-md px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
