'use client';

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/src/hooks/use-theme";
import { Button } from "@/src/components/ui/button";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder that matches the server render
    return (
      <Button variant="ghost" size="icon" title="Toggle dark mode">
        <Moon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle dark mode">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

export default ThemeToggle;
