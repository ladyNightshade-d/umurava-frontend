'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Brain, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, sanitizeError } from "@/src/lib/apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      
      setSent(true);
      toast.success("OTP sent successfully!");
      
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (error: unknown) {
      toast.error(sanitizeError(error, "Unable to send OTP. Please try again."));
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
          <CardTitle>Forgot password?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a 6-digit OTP
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
                  <MailCheck className="h-7 w-7 text-green-500" />
                </div>
              </div>
              <p className="font-semibold text-foreground">Check your inbox</p>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit OTP to <span className="font-medium text-foreground">{email}</span>. Check your spam folder if you don't see it.
              </p>
              <p className="text-xs text-muted-foreground">The OTP expires in 10 minutes.</p>
              <p className="text-xs text-muted-foreground mt-2">Redirecting to verification page...</p>
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
                />
                <p className="text-xs text-muted-foreground">
                  Enter the email you used to register your account
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link href="/auth" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
