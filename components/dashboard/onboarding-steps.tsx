import { Upload, Search, BarChart3 } from "lucide-react";

export function OnboardingSteps() {
  const steps = [
    {
      num: "01",
      title: "Upload",
      desc: "Upload an image to begin.",
      icon: Upload,
    },
    {
      num: "02",
      title: "Analyze",
      desc: "PIXENTRA examines the image for manipulation using advanced AI models.",
      icon: Search,
    },
    {
      num: "03",
      title: "Understand",
      desc: "Explore localization, forensic evidence and detailed explanations.",
      icon: BarChart3,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100/90 p-6 sm:p-7 shadow-xs h-full flex flex-col justify-between">
      {/* Header */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          Your first forensic investigation
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Get started in three simple steps.
        </p>
      </div>

      {/* Stepper Timeline */}
      <div className="py-6 space-y-6 relative">
        {/* Continuous vertical connecting line */}
        <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gray-100 -translate-x-1/2 pointer-events-none" />

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="relative flex items-start gap-4">
              {/* Number Badge */}
              <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100/80 text-[#1a7fc4] flex flex-col items-center justify-center shrink-0 z-10 shadow-2xs">
                <span className="text-[10px] font-bold tracking-tight text-blue-400">
                  {step.num}
                </span>
                <Icon className="w-4 h-4 text-[#1a7fc4]" />
              </div>

              {/* Step Info */}
              <div className="min-w-0 pt-1">
                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer subtle tip */}
      <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
        <span>Multi-evidence engine</span>
        <span className="font-semibold text-gray-500">Ready</span>
      </div>
    </div>
  );
}
