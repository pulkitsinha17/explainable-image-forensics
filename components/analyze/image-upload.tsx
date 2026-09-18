"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import { Upload, X, Play, AlertCircle, Info } from "lucide-react";
import type { SelectedImageData, S3UploadState } from "./types";

interface ImageUploadProps {
  onImageSelected: (data: SelectedImageData) => void;
  selectedImage: SelectedImageData | null;
  onClearImage: () => void;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
  /** Upload state from parent, used for disabling buttons during S3 upload */
  uploadState?: S3UploadState;
}

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "tiff", "tif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function ImageUpload({
  onImageSelected,
  selectedImage,
  onClearImage,
  onStartAnalysis,
  isAnalyzing,
  uploadState,
}: ImageUploadProps) {
  // A sample/demo image has no File object — the user must select a real file.
  const isSampleImage = selectedImage !== null && !selectedImage.file;
  const isDisabled = isAnalyzing || uploadState?.status === "complete";
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Validate extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setErrorMessage(
        `Unsupported file type (.${extension || "unknown"}). Please upload a JPG, JPEG, PNG, WEBP, or TIFF file.`
      );
      return;
    }

    // Validate size (10MB max)
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${formatFileSize(file.size)}). Maximum allowed size is 10 MB.`
      );
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    // Read image dimensions
    const img = new window.Image();
    img.onload = () => {
      onImageSelected({
        file,
        previewUrl,
        name: file.name,
        sizeFormatted: formatFileSize(file.size),
        dimensions: `${img.naturalWidth} × ${img.naturalHeight}`,
        format: extension.toUpperCase() === "JPG" ? "JPEG" : extension.toUpperCase(),
      });
    };
    img.onerror = () => {
      onImageSelected({
        file,
        previewUrl,
        name: file.name,
        sizeFormatted: formatFileSize(file.size),
        dimensions: "1920 × 1080",
        format: extension.toUpperCase(),
      });
    };
    img.src = previewUrl;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDropZoneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    triggerFileInput();
  };

  // The drop zone (always present)
  const dropZone = (
    <div
      onClick={handleDropZoneClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label="Upload an image for analysis"
      onKeyDown={(e) => {
        if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          triggerFileInput();
        }
      }}
      className={`relative flex flex-col justify-center items-center h-full min-h-[300px] bg-white rounded-2xl border-2 border-dashed transition-all duration-200 p-6 sm:p-8 text-center group focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/40 ${
        isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${
        isDragging
          ? "border-[#1a7fc4] bg-blue-50/40 shadow-md ring-4 ring-[#1a7fc4]/10"
          : "border-[#bfdbfe]/80 hover:border-[#1a7fc4] hover:bg-blue-50/15"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.tiff,.tif,image/jpeg,image/png,image/webp,image/tiff"
        onChange={handleFileChange}
        className="hidden"
        disabled={isDisabled}
      />

      {/* Upload Icon & Text Prompts */}
      <div className="flex flex-col items-center justify-center pointer-events-none select-none">
        <div className="w-14 h-14 rounded-2xl bg-[#eef6fc] text-[#1a7fc4] flex items-center justify-center mb-3.5 transition-transform group-hover:scale-105 shadow-2xs">
          <Upload className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
          Drag &amp; drop your image here
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">
          or click to browse from your device
        </p>

        <p className="text-[11px] text-gray-400">
          Supports JPG, PNG, WebP (max 10MB)
        </p>
      </div>

      {/* Selected Image Compact Card inside Upload Area */}
      {selectedImage && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-5 w-full bg-white rounded-xl border border-gray-200/80 shadow-xs p-3 sm:p-3.5 flex items-center justify-between gap-3 text-left cursor-default animate-fade-in"
        >
          {/* Left: Thumbnail + Metadata */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-2xs">
              <Image
                src={selectedImage.previewUrl}
                alt={selectedImage.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                  {selectedImage.name}
                </p>
                <button
                  type="button"
                  onClick={onClearImage}
                  disabled={isDisabled}
                  className="p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors shrink-0"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 font-medium truncate">
                <span>{selectedImage.sizeFormatted}</span>
                <span className="text-gray-300">•</span>
                <span>{selectedImage.dimensions}</span>
                <span className="text-gray-300">•</span>
                <span className="uppercase">{selectedImage.format}</span>
              </p>

              {/* Hint: sample images can't be uploaded — user must pick real file */}
              {isSampleImage && (
                <p className="flex items-center gap-1 mt-1 text-[11px] text-amber-700 font-medium truncate">
                  <Info className="w-3 h-3 shrink-0" />
                  Select an image from your device to enable upload.
                </p>
              )}
            </div>
          </div>

          {/* Right: Start Analysis CTA */}
          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={onStartAnalysis}
              disabled={isDisabled || isSampleImage}
              title={isSampleImage ? "Select a real image from your device first" : undefined}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#1a7fc4] hover:bg-[#1565a8] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Analysis</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Two-column layout: drop zone (left ~50%) + image collage (right ~50%) */}
      {/* On mobile the collage is hidden to preserve clean UX */}
      <div className="flex flex-col md:flex-row gap-5 items-stretch">
        {/* LEFT — Upload drop zone (~50%) */}
        <div className="w-full md:w-1/2 flex flex-col min-w-0">
          {dropZone}
        </div>

        {/* RIGHT — Organic forensic image collage (~50%), desktop only */}
        <div
          className="hidden md:grid md:w-1/2 min-w-0 gap-2 sm:gap-2.5 overflow-hidden rounded-2xl h-full min-h-[300px]"
          style={{
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            gridTemplateRows: "repeat(12, minmax(0, 1fr))",
          }}
          aria-hidden="true"
        >
          {/* Card 1: Top-Left [ Small / Wide ] */}
          <div
            className="relative min-h-0 min-w-0 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300"
            style={{ gridColumn: "1 / span 4", gridRow: "1 / span 3" }}
          >
            <Image
              src="/images/pixentra_analysis_2.webp"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 18vw"
            />
          </div>

          {/* Card 2: Top-Center [ Small ] */}
          <div
            className="relative min-h-0 min-w-0 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300"
            style={{ gridColumn: "5 / span 4", gridRow: "1 / span 3" }}
          >
            <Image
              src="/images/pixentra_analysis_8.webp"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 18vw"
            />
          </div>

          {/* Card 3: Top-Right [ Medium ] */}
          <div
            className="relative min-h-0 min-w-0 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300"
            style={{ gridColumn: "9 / span 4", gridRow: "1 / span 4" }}
          >
            <Image
              src="/images/pixentra_analysis_3.webp"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 18vw"
            />
          </div>

          {/* Card 4: Center-Left [ LARGE / WIDE Hero Image ] */}
          <div
            className="relative min-h-0 min-w-0 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300"
            style={{ gridColumn: "1 / span 6", gridRow: "4 / span 5" }}
          >
            <Image
              src="/images/pixentra_analysis_1.webp"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>

          {/* Card 5: Center-Right [ Tall Slim Portrait ] */}
          <div
            className="relative min-h-0 min-w-0 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300"
            style={{ gridColumn: "7 / span 2", gridRow: "4 / span 5" }}
          >
            <Image
              src="/images/pixentra_analysis_7.webp"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 12vw"
            />
          </div>

          {/* Card 6: Center-Right [ Medium Portrait / Square ] */}
          <div
            className="relative min-h-0 min-w-0 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300"
            style={{ gridColumn: "9 / span 4", gridRow: "5 / span 4" }}
          >
            <Image
              src="/images/pixentra_analysis_4.webp"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 18vw"
            />
          </div>

          {/* Card 7: Bottom-Left [ Small / Square ] */}
          <div
            className="relative min-h-0 min-w-0 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300"
            style={{ gridColumn: "1 / span 3", gridRow: "9 / span 4" }}
          >
            <Image
              src="/images/pixentra_analysis_6.webp"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 14vw"
            />
          </div>

          {/* Card 8: Bottom-Center [ Small / Square ] */}
          <div
            className="relative min-h-0 min-w-0 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300"
            style={{ gridColumn: "4 / span 3", gridRow: "9 / span 4" }}
          >
            <Image
              src="/images/pixentra_analysis_5.webp"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 14vw"
            />
          </div>

          {/* Card 9: Bottom-Right [ LARGE / WIDE Image ] */}
          <div
            className="relative min-h-0 min-w-0 rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300"
            style={{ gridColumn: "7 / span 6", gridRow: "9 / span 4" }}
          >
            <Image
              src="/images/pixentra_analysis_9.png"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
        </div>
      </div>

      {/* Validation Error Alert */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200/80 rounded-xl text-xs sm:text-sm text-red-800 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-800 p-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
