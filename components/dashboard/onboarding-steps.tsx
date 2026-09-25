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
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs h-full flex flex-col justify-between hover:border-slate-300 transition-all">
      {/* Header */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          How to get started
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Run your forensic investigation in three simple steps.
        </p>
      </div>

      {/* Stepper Timeline */}
      <div className="py-4 space-y-4 relative">
        {/* Continuous vertical connecting line */}
        <div className="absolute left-5 top-7 bottom-7 w-0.5 bg-slate-100 -translate-x-1/2 pointer-events-none" />

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="relative flex items-start gap-3.5">
              {/* Number Badge */}
              <div className="w-10 h-10 rounded-xl bg-blue-50/90 border border-blue-100/90 text-[#1a7fc4] flex flex-col items-center justify-center shrink-0 z-10 shadow-2xs">
                <span className="text-[9px] font-bold font-mono tracking-tight text-blue-400">
                  {step.num}
                </span>
                <Icon className="w-3.5 h-3.5 text-[#1a7fc4]" />
              </div>

              {/* Step Info */}
              <div className="min-w-0 pt-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {step.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer status */}
      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Forensic Pipeline</span>
        <span className="font-semibold text-emerald-600 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ready
        </span>
      </div>
    </div>
  );
}
