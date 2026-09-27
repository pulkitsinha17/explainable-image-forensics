import { Upload, Search, BarChart3 } from "lucide-react";

export function OnboardingSteps() {
  const steps = [
    {
      num: "01",
      title: "Upload",
      desc: "Upload an image to begin inspection.",
      icon: Upload,
    },
    {
      num: "02",
      title: "Analyze",
      desc: "PIXENTRA examines the image for manipulation using multi-evidence models.",
      icon: Search,
    },
    {
      num: "03",
      title: "Understand",
      desc: "Explore localized heatmaps, evidence breakdowns, and full explanations.",
      icon: BarChart3,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs h-full flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      {/* Header */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          How to get started
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Run your forensic investigation in three simple steps.
        </p>
      </div>

      {/* Stepper Timeline */}
      <div className="flex-1 flex flex-col justify-between pt-6 sm:pt-8 pb-1 relative">
        {/* Continuous vertical connecting line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-100 dark:bg-slate-800 -translate-x-1/2 pointer-events-none" />

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="relative flex items-start gap-3.5">
              {/* Number Badge */}
              <div className="w-10 h-10 rounded-xl bg-blue-50/90 dark:bg-blue-950/60 border border-blue-100/90 dark:border-blue-900/50 text-[#1a7fc4] dark:text-[#5bb8f5] flex flex-col items-center justify-center shrink-0 z-10 shadow-2xs">
                <span className="text-[9px] font-bold font-mono tracking-tight text-blue-400 dark:text-blue-300">
                  {step.num}
                </span>
                <Icon className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
              </div>

              {/* Step Info */}
              <div className="min-w-0 pt-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {step.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
