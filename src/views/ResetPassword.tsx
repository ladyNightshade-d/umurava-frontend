'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Brain, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2, Timer } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, sanitizeError } from "@/src/lib/apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (!emailParam) {
      toast.error("Email is required. Please start from forgot password page.");
      router.push("/forgot-password");
    }
  }, [emailParam, router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendOTP = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      // Wake up Render free tier
      await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }).catch(() => {});

      const res = await apiFetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend OTP");
      
      toast.success("New OTP sent to your email!");
      setTimeLeft(600); // Reset timer
      setOtp(""); // Clear previous OTP
    } catch (error: unknown) {
      toast.error(sanitizeError(error, "Unable to resend OTP. Please try again."));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    
    if (timeLeft <= 0) {
      toast.error("OTP has expired. Please request a new one.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await apiFetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      
      setDone(true);
      toast.success("Password reset successfully!");
    } catch (error: unknown) {
      toast.error(sanitizeError(error, "Password reset failed. Please check your OTP and try again."));
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter the OTP sent to your email and set a new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-green-500" />
                </div>
              </div>
              <p className="font-semibold text-foreground">Password updated!</p>
              <p className="text-sm text-muted-foreground">Your password has been reset successfully.</p>
              <Button className="w-full" onClick={() => router.push("/auth")}>
                Sign in now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp">6-Digit OTP</Label>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Timer className="h-3 w-3" />
                    <span className={timeLeft < 60 ? "text-destructive font-medium" : ""}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <div className="flex items-center justify-between text-xs">
                  <p className="text-muted-foreground">
                    Check your email for the OTP
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={resendLoading || timeLeft > 540} // Disable for first 1 minute
                    className="h-auto p-0"
                  >
                    {resendLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Resend OTP"
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords don't match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || password !== confirmPassword || otp.length !== 6 || timeLeft <= 0}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset password
              </Button>

              {timeLeft <= 0 && (
                <p className="text-xs text-center text-destructive">
                  OTP expired. Please request a new one.
                </p>
              )}
            </form>
          )}
          {!done && (
            <div className="mt-6 text-center">
              <Link href="/forgot-password" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to forgot password
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
