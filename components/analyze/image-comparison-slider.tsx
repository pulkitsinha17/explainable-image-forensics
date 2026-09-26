"use client";

import { useState, useEffect, useRef, useCallback, MouseEvent, TouchEvent } from "react";
import Image from "next/image";
import { ChevronsLeftRight, SplitSquareHorizontal, Layers, Image as ImageIcon } from "lucide-react";

interface ImageComparisonSliderProps {
  originalImage: string;
  heatmapImage?: string;
  alt?: string;
}

export function ImageComparisonSlider({
  originalImage,
  heatmapImage,
  alt = "Forensic Comparison",
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "side" | "heatmap" | "original">("split");
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setContainerWidth(el.clientWidth);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [viewMode]);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pos);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    handleMove(e.clientX);
  };

  // Default heatmap overlay if separate heatmap asset is not provided
  // Renders a thermal false-color heatmap gradient layer over the image
  const renderHeatmapContent = () => {
    if (heatmapImage) {
      return (
        <Image
          src={heatmapImage}
          alt="Localization Heatmap"
          fill
          unoptimized
          className="object-cover"
        />
      );
    }

    return (
      <div className="relative w-full h-full">
        {/* Base Image */}
        <Image
          src={originalImage}
          alt="Localization Base"
          fill
          unoptimized
          className="object-cover"
        />
        {/* Forensic Thermal Gradient Heatmap Overlay */}
        <div
          className="absolute inset-0 mix-blend-multiply opacity-80 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 55% 45%, rgba(239, 68, 68, 0.95) 0%, rgba(245, 158, 11, 0.85) 35%, rgba(16, 185, 129, 0.7) 65%, rgba(59, 130, 246, 0.4) 100%)",
          }}
        />
        <div
          className="absolute inset-0 mix-blend-color-dodge opacity-60 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 60% 40%, rgba(254, 240, 138, 0.9) 0%, rgba(239, 68, 68, 0.6) 40%, transparent 80%)",
          }}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* View Mode Switcher Pills (Header actions) */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Interactive Comparison
        </span>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
              viewMode === "split"
                ? "bg-white text-[#1a7fc4] shadow-xs font-semibold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Split Slider
          </button>
          <button
            type="button"
            onClick={() => setViewMode("side")}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
              viewMode === "side"
                ? "bg-white text-[#1a7fc4] shadow-xs font-semibold"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Side by Side
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      {viewMode === "split" && (
        <div className="space-y-2.5">
          <div
            ref={containerRef}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden cursor-ew-resize select-none bg-gray-900 border border-gray-200/80 shadow-inner group touch-none"
          >
            {/* Background Layer: Localization Heatmap */}
            <div className="absolute inset-0 w-full h-full">
              {renderHeatmapContent()}
            </div>

            {/* Foreground Layer (Clipped): Original Image */}
            <div
              className="absolute inset-0 h-full overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <div
                className="absolute inset-0 h-full"
                style={{
                  width: containerWidth > 0
                    ? `${containerWidth}px`
                    : containerRef.current
                    ? `${containerRef.current.clientWidth}px`
                    : "100%",
                }}
              >
                <Image
                  src={originalImage}
                  alt={alt}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>

            {/* Vertical Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Circular Drag Handle */}
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-gray-800 shadow-md border border-gray-200 flex items-center justify-center pointer-events-auto transition-transform group-hover:scale-110 active:scale-95">
                <ChevronsLeftRight className="w-4 h-4 text-gray-700" />
              </div>
            </div>
          </div>

          {/* Subtitle labels matching reference image */}
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-gray-600">
            <span>Original Image</span>
            <span>Localization Map</span>
          </div>
        </div>
      )}

      {/* Side-by-Side Mode */}
      {viewMode === "side" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-gray-200 bg-gray-900">
              <Image
                src={originalImage}
                alt="Original Image"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <p className="text-center text-xs font-semibold text-gray-600">
              Original Image
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-gray-200 bg-gray-900">
              {renderHeatmapContent()}
            </div>
            <p className="text-center text-xs font-semibold text-gray-600">
              Localization Map
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
