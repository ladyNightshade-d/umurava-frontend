'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/src/components/ui/button";
import { Brain, Briefcase, FileText, MessageSquare, User, LogOut } from "lucide-react";
import { cn } from "@/src/lib/utils";
import ThemeToggle from "@/src/components/ThemeToggle";

const navItems = [
  { to: "/candidate/jobs", icon: Briefcase, label: "Job Board" },
  { to: "/candidate/applications", icon: FileText, label: "My Applications" },
  { to: "/candidate/feedback", icon: MessageSquare, label: "AI Feedback" },
  { to: "/candidate/profile", icon: User, label: "Profile" },
];

const CandidateLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-muted/30">
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link href="/candidate/jobs" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center">
              <Brain className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-bold text-foreground">HireWise <span className="text-accent">Candidate</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.to}
                variant="ghost"
                size="sm"
                asChild
                className={cn("gap-2", pathname === item.to && "bg-muted")}
              >
                <Link href={item.to}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="md:hidden border-b bg-card">
        <div className="flex overflow-x-auto px-4 gap-1 py-1">
          {navItems.map((item) => (
            <Button
              key={item.to}
              variant="ghost"
              size="sm"
              asChild
              className={cn("gap-1 shrink-0 text-xs", pathname === item.to && "bg-muted")}
            >
              <Link href={item.to}>
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default CandidateLayout;
