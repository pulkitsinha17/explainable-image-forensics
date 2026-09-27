"use client";

import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { SPRING_PRESS } from "@/components/motion-utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "compact" | "sidebar";
}

export function ThemeToggle({ className = "", variant = "default" }: ThemeToggleProps) {
  const { theme, toggleTheme, isMounted } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const isDark = isMounted ? theme === "dark" : false;

  const getButtonStyles = () => {
    if (variant === "sidebar") {
      return "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 outline-none focus-visible:ring-2 focus-visible:ring-[#1a7fc4]";
    }
    if (variant === "compact") {
      return "p-2 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#1a7fc4] cursor-pointer shadow-2xs";
    }
    return "p-2.5 min-w-[42px] min-h-[42px] rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#1a7fc4] cursor-pointer shadow-2xs";
  };

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.94 }}
      transition={SPRING_PRESS}
      className={`${getButtonStyles()} ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              className="flex items-center justify-center text-sky-400"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, rotate: -60, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, rotate: 60, scale: 0.7 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Moon className="w-4.5 h-4.5" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              className="flex items-center justify-center text-amber-500"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, rotate: 60, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, rotate: -60, scale: 0.7 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Sun className="w-4.5 h-4.5" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {variant === "sidebar" && (
        <span className="truncate">{isDark ? "Light Mode" : "Dark Mode"}</span>
      )}
    </motion.button>
  );
}
