"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  UploadCloud,
  Cpu,
  Layers,
  FileCheck2,
  ArrowRight,
} from "lucide-react";
import { EASE_OUT, SPRING_PRESS } from "@/components/motion-utils";

export function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      stepNumber: "01",
      title: "1. Upload",
      description: "Select and upload an image from your device.",
      icon: UploadCloud,
      color: {
        iconBg: "bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] border-blue-150 dark:border-blue-900/50 group-hover:bg-blue-100/70 dark:group-hover:bg-blue-900/40",
        cardBg: "bg-blue-50/20 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-slate-800/80 border-blue-100/60 dark:border-slate-700/60 hover:border-blue-300/70 dark:hover:border-blue-500/40",
        badge: "text-blue-600 dark:text-[#5bb8f5] bg-blue-100/50 dark:bg-blue-950/70 border-blue-200/50 dark:border-blue-800/50",
        dot: "bg-blue-500",
      },
    },
    {
      stepNumber: "02",
      title: "2. Analyze",
      description: "PIXENTRA examines the image using multiple forensic techniques.",
      icon: Cpu,
      color: {
        iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-150 dark:border-indigo-900/50 group-hover:bg-indigo-100/70 dark:group-hover:bg-indigo-900/40",
        cardBg: "bg-indigo-50/20 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-slate-800/80 border-indigo-100/60 dark:border-slate-700/60 hover:border-indigo-300/70 dark:hover:border-indigo-500/40",
        badge: "text-indigo-600 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-950/70 border-indigo-200/50 dark:border-indigo-800/50",
        dot: "bg-indigo-500",
      },
    },
    {
      stepNumber: "03",
      title: "3. Generate Results",
      description: "Get localization maps, evidence scores and AI explanations.",
      icon: Layers,
      color: {
        iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-150 dark:border-amber-900/50 group-hover:bg-amber-100/70 dark:group-hover:bg-amber-900/40",
        cardBg: "bg-amber-50/20 dark:bg-slate-800/40 hover:bg-amber-50/40 dark:hover:bg-slate-800/80 border-amber-100/60 dark:border-slate-700/60 hover:border-amber-300/70 dark:hover:border-amber-500/40",
        badge: "text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-950/70 border-amber-200/50 dark:border-amber-800/50",
        dot: "bg-amber-500",
      },
    },
    {
      stepNumber: "04",
      title: "4. Explore",
      description: "View, download or share your forensic report.",
      icon: FileCheck2,
      color: {
        iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-150 dark:border-emerald-900/50 group-hover:bg-emerald-100/70 dark:group-hover:bg-emerald-900/40",
        cardBg: "bg-emerald-50/20 dark:bg-slate-800/40 hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 border-emerald-100/60 dark:border-slate-700/60 hover:border-emerald-300/70 dark:hover:border-emerald-500/40",
        badge: "text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/70 border-emerald-200/50 dark:border-emerald-800/50",
        dot: "bg-emerald-500",
      },
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.1 : 0.4, ease: EASE_OUT },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-5"
    >
      {/* Clean, unbloated header */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          How PIXENTRA Works
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          A multi-evidence approach to image forensics.
        </p>
      </div>

      {/* 4 Softly Colored Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;

          return (
            <motion.div
              key={step.stepNumber}
              variants={itemVariants}
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              transition={SPRING_PRESS}
              className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 shadow-2xs ${step.color.cardBg}`}
            >
              <div>
                {/* Top: Icon + Step Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center border shadow-2xs transition-colors duration-200 ${step.color.iconBg}`}
                  >
                    <Icon className="w-4.5 h-4.5 stroke-[2]" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${step.color.badge}`}
                    >
                      {step.stepNumber}
                    </span>
                    {!isLast && (
                      <ArrowRight className="hidden lg:block w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </div>

                {/* Step Title & Description */}
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Bottom Dot Indicator */}
              <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-700/60 flex items-center justify-end">
                <span className={`w-1.5 h-1.5 rounded-full ${step.color.dot}`} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

