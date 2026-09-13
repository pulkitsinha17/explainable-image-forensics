"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import { Upload, X, Play, AlertCircle } from "lucide-react";
import type { SelectedImageData } from "./types";

interface ImageUploadProps {
  onImageSelected: (data: SelectedImageData) => void;
  selectedImage: SelectedImageData | null;
  onClearImage: () => void;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
}

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "tiff", "tif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function ImageUpload({
  onImageSelected,
  selectedImage,
  onClearImage,
  onStartAnalysis,
  isAnalyzing,
}: ImageUploadProps) {
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

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative bg-white rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-10 text-center ${
          isDragging
            ? "border-[#1a7fc4] bg-blue-50/40 shadow-md ring-4 ring-[#1a7fc4]/10"
            : "border-[#bfdbfe]/70 hover:border-[#1a7fc4]/60 bg-white"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.tiff,.tif,image/jpeg,image/png,image/webp,image/tiff"
          onChange={handleFileChange}
          className="hidden"
          disabled={isAnalyzing}
        />

        {/* Upload Icon & Text Prompts */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#eef6fc] text-[#1a7fc4] flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-2xs">
            <Upload className="w-6 h-6 stroke-[2.2]" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
            Drag & drop your image here
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-5">
            or click to browse from your device
          </p>

          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isAnalyzing}
            className="px-6 py-2.5 bg-[#1a7fc4] hover:bg-[#1565a8] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow"
          >
            Select Image
          </button>
        </div>

        {/* Selected Image Compact Row inside Upload Card */}
        {selectedImage && (
          <div className="mt-7 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl text-left animate-fade-in">
            {/* Left: Thumbnail + Metadata */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-2xs">
                <Image
                  src={selectedImage.previewUrl}
                  alt={selectedImage.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {selectedImage.name}
                  </p>
                  <button
                    type="button"
                    onClick={onClearImage}
                    disabled={isAnalyzing}
                    className="p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2 font-medium flex-wrap">
                  <span>{selectedImage.sizeFormatted}</span>
                  <span className="text-gray-300">•</span>
                  <span>{selectedImage.dimensions}</span>
                  <span className="text-gray-300">•</span>
                  <span className="uppercase">{selectedImage.format}</span>
                </p>
              </div>
            </div>

            {/* Right: Start Analysis CTA */}
            <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
              <button
                type="button"
                onClick={onStartAnalysis}
                disabled={isAnalyzing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1a7fc4] hover:bg-[#1565a8] active:scale-[0.98] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Analysis</span>
              </button>
            </div>
          </div>
        )}
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
