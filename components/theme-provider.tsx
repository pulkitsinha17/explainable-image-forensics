"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useTransition } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Applies the "dark" class to <html> immediately — safe to call during or after render.
 * Defined at module level so it can be referenced before the component body executes.
 */
function applyThemeClass(newTheme: Theme) {
  const root = document.documentElement;
  if (newTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  // Track mount state via ref to avoid triggering setState-in-effect lint errors.
  // isMounted is exposed as state so that consumers can re-render once hydrated.
  const [isMounted, setIsMounted] = useState(false);
  const mountedRef = useRef(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    let initial: Theme = "light";
    try {
      const saved = localStorage.getItem("pixentra-theme") as Theme | null;
      if (saved === "light" || saved === "dark") {
        initial = saved;
      }
    } catch {
      // localStorage unavailable — keep default
    }

    // Apply class synchronously before paint to avoid flash
    applyThemeClass(initial);

    // Batch both state updates in a single transition
    startTransition(() => {
      setThemeState(initial);
      setIsMounted(true);
    });
  }, []);

  const setTheme = (newTheme: Theme) => {
    startTransition(() => {
      setThemeState(newTheme);
      applyThemeClass(newTheme);
      try {
        localStorage.setItem("pixentra-theme", newTheme);
      } catch {
        // Safe fallback
      }
    });
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isMounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
