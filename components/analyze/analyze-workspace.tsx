"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopNavBar } from "./top-nav-bar";
import { ImageUpload } from "./image-upload";
import { AnalysisProgress } from "./analysis-progress";
import { UploadSuccessCard } from "./upload-success-card";
import { HowItWorks } from "./how-it-works";
import { PrivacyCard } from "./privacy-card";
import type { SelectedImageData, S3UploadState } from "./types";

interface AnalyzeWorkspaceProps {
  userInitial?: string;
  userDisplayName?: string;
}

export function AnalyzeWorkspace({
  userInitial = "P",
  userDisplayName = "Pulkit Sinha",
}: AnalyzeWorkspaceProps) {
  const [selectedImage, setSelectedImage] = useState<SelectedImageData | null>(null);

  /** Upload phase state — tracks presign request + actual S3 PUT progress */
  const [uploadState, setUploadState] = useState<S3UploadState>({
    status: "idle",
    progress: 0,
    s3Key: null,
    errorMessage: null,
  });

  /** Convenience derived booleans */
  const isUploading =
    uploadState.status === "requesting" || uploadState.status === "uploading";
  const uploadDone = uploadState.status === "complete";
  const uploadError = uploadState.status === "error";

  /**
   * Map the S3 upload status to the progress-bar stage labels.
   * Phase 3 will add "analyzing" / "generating" / "finishing" stages
   * once the FastAPI pipeline is wired up.
   */
  const currentStage: "uploading" | "analyzing" | "generating" | "finishing" =
    uploadState.status === "requesting" ? "uploading" : "uploading";

  const handleStartAnalysis = async () => {
    if (!selectedImage?.file) {
      setUploadState({
        status: "error",
        progress: 0,
        s3Key: null,
        errorMessage:
          "No image file selected. Please select a real image from your device.",
      });
      return;
    }

    const file = selectedImage.file;

    // ── Step 1: Request a presigned URL from the server ───────────────────────
    setUploadState({ status: "requesting", progress: 0, s3Key: null, errorMessage: null });

    let uploadUrl: string;
    let s3Key: string;

    try {
      const res = await fetch("/api/analyze/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSizeBytes: file.size,
        }),
      });

      if (!res.ok) {
        let msg = "Failed to prepare the upload. Please try again.";
        try {
          const json = await res.json();
          if (typeof json?.error === "string") msg = json.error;
        } catch {
          /* ignore parse error */
        }
        setUploadState({ status: "error", progress: 0, s3Key: null, errorMessage: msg });
        return;
      }

      const json = await res.json();
      uploadUrl = json.uploadUrl;
      s3Key = json.s3Key;
    } catch {
      setUploadState({
        status: "error",
        progress: 0,
        s3Key: null,
        errorMessage:
          "Network error while preparing the upload. Check your connection and try again.",
      });
      return;
    }

    // ── Step 2: Upload directly from the browser to S3 ───────────────────────
    setUploadState({ status: "uploading", progress: 5, s3Key: null, errorMessage: null });

    try {
      await uploadToS3WithProgress(file, uploadUrl, (pct) => {
        setUploadState((prev) => ({ ...prev, progress: pct }));
      });
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error("[S3 upload] Failed:", detail);
      setUploadState({
        status: "error",
        progress: 0,
        s3Key: null,
        errorMessage:
          detail.includes("CORS") || detail.includes("Network error")
            ? "Upload failed. Please ensure S3 bucket CORS permissions are configured to allow uploads from your browser."
            : `Upload to secure storage failed: ${detail}`,
      });
      return;
    }

    // ── Step 3: Mark upload complete ─────────────────────────────────────────
    setUploadState({ status: "complete", progress: 100, s3Key, errorMessage: null });

    // ── Phase 3 hook ──────────────────────────────────────────────────────────
    // When the FastAPI / MPC pipeline is ready, trigger forensic analysis here:
    //
    //   const analysisRes = await fetch("/api/analyze/run", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ s3Key }),
    //   });
    //   const analysisResult = await analysisRes.json();
    //   setResults(analysisResult);
    //
    // ─────────────────────────────────────────────────────────────────────────
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setUploadState({ status: "idle", progress: 0, s3Key: null, errorMessage: null });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Utility Nav Bar */}
      <TopNavBar userInitial={userInitial} userDisplayName={userDisplayName} />

      {/* Page Header */}
      <div className="space-y-1.5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1a7fc4] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Analyze an Image
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-3xl">
          Upload an image to perform deep multi-evidence forensic analysis and uncover the truth behind its pixels.
        </p>
      </div>

      {/* 1. Upload Card & Selected Image Preview */}
      <ImageUpload
        onImageSelected={(img) => {
          setSelectedImage(img);
          setUploadState({ status: "idle", progress: 0, s3Key: null, errorMessage: null });
        }}
        selectedImage={selectedImage}
        onClearImage={handleClearImage}
        onStartAnalysis={handleStartAnalysis}
        isAnalyzing={isUploading}
        uploadState={uploadState}
      />

      {/* 2. Upload Progress State (while uploading to S3) */}
      {isUploading && (
        <AnalysisProgress
          progress={uploadState.progress}
          currentStage={currentStage}
          label="Uploading your image..."
          subtitle="Securely transferring your image to PIXENTRA's private vault."
        />
      )}

      {/* 3. Upload Error State */}
      {uploadError && uploadState.errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200/80 rounded-xl text-xs sm:text-sm text-red-800 animate-fade-in">
          <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="font-medium flex-1">{uploadState.errorMessage}</p>
        </div>
      )}

      {/* 4. Upload Success State — clearly NOT forensic analysis results */}
      {uploadDone && uploadState.s3Key && selectedImage && (
        <UploadSuccessCard
          s3Key={uploadState.s3Key}
          filename={selectedImage.name}
        />
      )}

      {/* 5. How PIXENTRA Works */}
      <HowItWorks />

      {/* 6. Privacy Reassurance Banner */}
      <PrivacyCard />
    </div>
  );
}

/**
 * Uploads a file to the given presigned S3 PUT URL using XMLHttpRequest
 * so we get real byte-level upload progress.
 *
 * Returns a Promise that resolves on HTTP 200 from S3 or rejects on any error.
 */
function uploadToS3WithProgress(
  file: File,
  presignedUrl: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        onProgress(Math.min(pct, 99)); // hold at 99 until response confirmed
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(
          new Error(
            `S3 PUT failed with status ${xhr.status}. Response: ${xhr.responseText.slice(0, 200)}`
          )
        );
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during S3 upload."));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("S3 upload was aborted."));
    });

    xhr.open("PUT", presignedUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}
