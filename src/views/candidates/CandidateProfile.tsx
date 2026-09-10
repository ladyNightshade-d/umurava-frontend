'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import CandidateLayout from "@/src/components/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const CandidateProfile = () => {
  const { user, token } = useAuth();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) return;
    
    const loadProfile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/candidates/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setName(data.name || user.name || "");
          setCompany(data.company || "");
        } else {
          setName(user.name || "");
        }
      } catch (err) {
        setName(user.name || "");
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user, token]);

  const save = async () => {
    if (!user || !token) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/candidates/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, company }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Card>
          <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Company / Current Employer</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
            </div>
            <Button onClick={save} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </CandidateLayout>
  );
};

export default CandidateProfile;
