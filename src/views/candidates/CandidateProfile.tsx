'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import CandidateLayout from "@/src/components/CandidateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CandidateProfile = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setName(data.name || "");
        setCompany(data.company || "");
      }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ name, company }).eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

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
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </CandidateLayout>
  );
};

export default CandidateProfile;
