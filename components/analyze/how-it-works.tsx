import { FileUp, Search, BarChart3, FileCheck, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      stepNumber: "1. Upload",
      title: "1. Upload",
      description: "Select and upload an image from your device.",
      icon: FileUp,
    },
    {
      stepNumber: "2. Analyze",
      title: "2. Analyze",
      description: "PIXENTRA examines the image using multiple forensic techniques.",
      icon: Search,
    },
    {
      stepNumber: "3. Generate Results",
      title: "3. Generate Results",
      description: "Get localization maps, evidence scores and AI explanations.",
      icon: BarChart3,
    },
    {
      stepNumber: "4. Explore",
      title: "4. Explore",
      description: "View, download or share your forensic report.",
      icon: FileCheck,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Heading */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          How PIXENTRA Works
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          A multi-evidence approach to image forensics.
        </p>
      </div>

      {/* 4 Steps Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.stepNumber} className="relative flex flex-col items-start space-y-3">
              {/* Icon Container with Arrow Connector */}
              <div className="w-full flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#eef6fc] text-[#1a7fc4] flex items-center justify-center shadow-2xs">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                {!isLast && (
                  <ArrowRight className="hidden lg:block w-4 h-4 text-gray-300 mr-2" />
                )}
              </div>

              {/* Text */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
