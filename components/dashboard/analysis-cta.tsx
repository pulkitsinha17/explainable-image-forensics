"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Upload } from "lucide-react";

export function AnalysisCTA() {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSlider = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSlider(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-100/80 bg-gradient-to-br from-blue-50/60 via-white to-blue-50/20 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow">
      <div className="grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Copy & Action */}
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-[#1a7fc4] text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#1a7fc4]" />
            <span>IMAGE FORENSIC ANALYSIS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Analyze an image
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed max-w-lg">
            Upload an image to detect manipulation and reveal pixel-level forensic evidence using advanced AI analysis.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-sm font-semibold shadow-sm hover:shadow transition-all group"
            >
              <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>Analyze an Image</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <span className="text-xs text-gray-400 sm:pl-2">
              JPG · JPEG · PNG · Max size 10MB
            </span>
          </div>
        </div>

        {/* Right Preview Graphic */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row items-center gap-6 justify-end">
          {/* Comparison Slider Frame */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[16/10] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-gray-200/80 shadow-md bg-gray-900 group"
            title="Drag slider to compare original vs forensic analysis"
          >
            {/* Base Image (Full) */}
            <div className="absolute inset-0">
              <Image
                src="/images/mountain.png"
                alt="Original photo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                priority
              />
            </div>

            {/* Original Badge */}
            <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-gray-900/75 backdrop-blur-xs text-[10px] font-medium text-white shadow-xs">
              Original
            </div>

            {/* Analysis Overlay with clipping */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
              <Image
                src="/images/mountain.png"
                alt="Analysis forensic view"
                fill
                className="object-cover brightness-90"
                sizes="(max-width: 768px) 100vw, 400px"
              />

              {/* Forensic Heatmap Overlays */}
              <div className="absolute inset-0 bg-blue-950/20" />
              <div
                className="absolute rounded-full blur-xl"
                style={{
                  width: "120px",
                  height: "90px",
                  background:
                    "radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(249, 115, 22, 0.7) 40%, rgba(234, 179, 8, 0.5) 70%, transparent 85%)",
                  top: "22%",
                  right: "18%",
                }}
              />
              <div
                className="absolute rounded-full blur-md"
                style={{
                  width: "60px",
                  height: "50px",
                  background:
                    "radial-gradient(circle, rgba(239, 68, 68, 0.95) 0%, rgba(59, 130, 246, 0.6) 80%, transparent 90%)",
                  top: "35%",
                  right: "26%",
                }}
              />

              {/* Analysis View Badge */}
              <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-gray-900/80 backdrop-blur-xs text-[10px] font-medium text-blue-200 border border-blue-400/30 shadow-xs">
                Analysis View
              </div>
            </div>

            {/* Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-20"
              style={{ left: `${sliderPos}%` }}
            />

            {/* Handle `< >` */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center pointer-events-none z-20 transition-transform group-hover:scale-110"
              style={{ left: `${sliderPos}%` }}
            >
              <span className="text-[10px] font-bold text-gray-600 tracking-tighter select-none">
                {"‹ ›"}
              </span>
            </div>
          </div>

          {/* Right Quote Callout */}
          <div className="hidden sm:flex flex-col justify-center text-left space-y-2 max-w-[130px] shrink-0">
            <p className="text-xs font-semibold text-gray-800 leading-snug">
              Uncover what others can&apos;t see
            </p>
            <div className="w-6 h-0.5 bg-[#1a7fc4] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
