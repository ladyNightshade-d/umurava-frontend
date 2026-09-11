import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: "recruiter" | "candidate";
}

// Allowlist of valid roles — prevents role escalation via localStorage manipulation
const VALID_ROLES: Array<User["role"]> = ["recruiter", "candidate"];

const sanitizeRole = (role: unknown): "recruiter" | "candidate" =>
  VALID_ROLES.includes(role as User["role"]) ? (role as "recruiter" | "candidate") : "recruiter";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  role: string | null;
  login: (token: string, user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  role: null,
  login: () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        // M-5: wrap JSON.parse in try/catch — malformed data clears session
        const parsed: User = JSON.parse(storedUser);
        // H-4: validate role against allowlist before trusting it
        const safeRole = sanitizeRole(parsed.role);
        setToken(storedToken);
        setUser({ ...parsed, role: safeRole });
        setRole(safeRole);
      }
    } catch {
      // Corrupted localStorage — clear everything and start fresh
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    // H-4: sanitize role before storing
    const safeRole = sanitizeRole(newUser.role);
    const safeUser: User = { ...newUser, role: safeRole };
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(safeUser));
    setToken(newToken);
    setUser(safeUser);
    setRole(safeRole);
  };

  const signOut = () => {
    // M-4: capture role BEFORE state-clearing calls (setState is async)
    const isCandidate = role === "candidate";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setRole(null);
    window.location.href = isCandidate ? "/candidate/auth" : "/auth";
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, role, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
