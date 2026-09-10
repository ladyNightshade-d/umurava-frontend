'use client';

import { useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import DashboardLayout from "@/src/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Loader2, User, Mail, Briefcase, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/src/lib/apiFetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Profile = () => {
  const { user, token, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error("New passwords don't match.");
      return;
    }
    if (form.newPassword && form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const body: any = { name: form.name };
      if (form.newPassword) {
        body.currentPassword = form.currentPassword;
        body.newPassword = form.newPassword;
      }
      const res = await apiFetch(`${BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      // Update auth context with new name
      if (user) login(token!, { ...user, name: form.name });
      toast.success("Profile updated!");
      setEditing(false);
      setForm(f => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account information</p>
        </div>

        {/* Avatar + info card */}
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-primary">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    <Shield className="h-3 w-3 mr-1" />
                    {user?.role || "recruiter"}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                {editing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info fields */}
        {!editing ? (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: User, label: "Full Name", value: user?.name },
                { icon: Mail, label: "Email Address", value: user?.email },
                { icon: Briefcase, label: "Role", value: user?.role || "Recruiter" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground capitalize">{value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Edit Profile</CardTitle>
              <CardDescription>Update your name or change your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={form.email} disabled className="opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="pt-2 border-t border-border/40 space-y-3">
                  <p className="text-sm font-medium text-foreground">Change Password <span className="text-muted-foreground font-normal">(optional)</span></p>
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="••••••••" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="••••••••" minLength={6} />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="••••••••" />
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
