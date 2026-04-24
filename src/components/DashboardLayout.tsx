'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/src/components/ui/button";
import {
  Brain,
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import ThemeToggle from "@/src/components/ThemeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/jobs/new", icon: Briefcase, label: "Create Job" },
  { to: "/candidates", icon: Users, label: "Candidates" },
  { to: "/results", icon: BarChart3, label: "Results" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // Default to false for SSR
  const [mounted, setMounted] = useState(false);

  // Handle hydration and localStorage after mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
      setCollapsed(savedCollapsed);
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar-collapsed", String(next));
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Sidebar (desktop) ──────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Brand */}
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center shrink-0">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-bold text-sidebar-foreground text-sm tracking-tight">
                HireWise AI
              </span>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <div className="px-2 py-2 border-b border-sidebar-border">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapsed}
                className={cn(
                  "w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  collapsed ? "justify-center px-0" : "justify-start gap-2"
                )}
              >
                {collapsed ? (
                  <PanelLeft className="h-3.5 w-3.5" />
                ) : (
                  <>
                    <PanelLeftClose className="h-3.5 w-3.5" />
                    <span className="text-xs">Collapse</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={8}>
                Expand sidebar
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.to;
            const linkContent = (
              <Link
                href={item.to}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-primary/15 text-primary border-l-2 border-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.to} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.to}>{linkContent}</div>;
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-2 py-3 space-y-1">

          {/* Theme toggle */}
          <div className={cn(
            "flex items-center gap-2 px-1 py-1 rounded-md",
            collapsed ? "justify-center" : ""
          )}>
            <ThemeToggle />
            {!collapsed && (
              <span className="text-xs text-sidebar-foreground/80 font-medium">
                Theme
              </span>
            )}
          </div>

          {/* Sign out */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className={cn(
                  "w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                  collapsed ? "justify-center px-0" : "justify-start gap-2"
                )}
              >
                <LogOut className="h-3.5 w-3.5" />
                {!collapsed && "Sign out"}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={8}>
                Sign out
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <Brain className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground text-sm">HireWise AI</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden border-b bg-card px-4 py-2 space-y-0.5">
            {navItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        <main className="flex-1 px-6 py-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
