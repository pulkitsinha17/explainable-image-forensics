"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Upload } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const DASHBOARD_IMAGES = [
  { src: "/images/dash_1.webp", alt: "Forensic image analysis 1" },
  { src: "/images/dash_2.webp", alt: "Forensic image analysis 2" },
  { src: "/images/dash_3.webp", alt: "Forensic image analysis 3" },
  { src: "/images/dash_4.webp", alt: "Forensic image analysis 4" },
  { src: "/images/dash_5.webp", alt: "Forensic image analysis 5" },
  { src: "/images/dash_6.webp", alt: "Forensic image analysis 6" },
];

// Duplicate 3 times to ensure a seamless infinite marquee loop
const TICKER_ITEMS = [
  ...DASHBOARD_IMAGES,
  ...DASHBOARD_IMAGES,
  ...DASHBOARD_IMAGES,
];

export function AnalysisCTA() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-br from-blue-50/50 via-white to-slate-50/50 p-6 sm:p-8 shadow-xs hover:shadow-sm transition-shadow">
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Action Area */}
        <div className="lg:col-span-5 space-y-4 z-10 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1a7fc4] text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#1a7fc4]" />
            <span>IMAGE FORENSICS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Analyze an image
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
            Upload an image to detect possible manipulation and uncover the evidence behind it.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-sm font-semibold shadow-xs hover:shadow transition-all group active:scale-[0.98]"
            >
              <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>Analyze an Image</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <span className="text-xs text-slate-400 sm:pl-2">
              JPG · JPEG · PNG · WEBP · Up to 10 MB
            </span>
          </div>
        </div>

        {/* Right Animated Stream of 6 Clean Images (Ending into the text) */}
        <div className="lg:col-span-7 relative w-full h-[200px] sm:h-[225px] flex items-center overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.8)_16%,black_35%,black_88%,transparent_100%)]">
          {/* Left blend fade adjacent to text */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/40 to-transparent pointer-events-none z-20" />
          
          {/* Right edge fade */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/40 to-transparent pointer-events-none z-20" />

          {/* Smooth Motion Ticker */}
          <motion.div
            className="flex items-center gap-4 sm:gap-4.5 w-max"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    x: ["0%", "-33.333%"],
                  }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 22,
                      ease: "linear",
                    },
                  }
            }
          >
            {TICKER_ITEMS.map((item, idx) => (
              <div
                key={`${item.src}-${idx}`}
                className="group relative w-[140px] sm:w-[160px] h-[180px] sm:h-[200px] rounded-2xl overflow-hidden shrink-0 border border-slate-200/90 shadow-2xs hover:shadow-md bg-slate-100 transition-all duration-300 hover:border-[#1a7fc4]/50"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 140px, 160px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
