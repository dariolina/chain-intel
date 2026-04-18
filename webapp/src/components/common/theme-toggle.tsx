"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative size-8"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        theme === "system"
          ? "Toggle color theme"
          : isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
      }
    >
      <Sun
        className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
        aria-hidden
      />
      <Moon
        className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
        aria-hidden
      />
    </Button>
  );
}
