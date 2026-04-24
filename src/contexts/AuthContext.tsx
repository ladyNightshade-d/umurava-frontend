import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabase";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  role: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  role: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Fetch role from profiles
        supabase.from("profiles").select("role").eq("user_id", session.user.id).single().then(({ data }) => {
          setRole(data?.role || "recruiter");
          setLoading(false);
        });
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        supabase.from("profiles").select("role").eq("user_id", session.user.id).single().then(({ data }) => {
          setRole(data?.role || "recruiter");
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, role, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
