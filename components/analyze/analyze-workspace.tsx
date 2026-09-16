"use client";

import { useState } from "react";
import { TopNavBar } from "./top-nav-bar";
import { ImageUpload } from "./image-upload";
import { AnalysisProgress } from "./analysis-progress";
import { AnalysisResults } from "./analysis-results";
import { HowItWorks } from "./how-it-works";
import { PrivacyCard } from "./privacy-card";
import type {
  SelectedImageData,
  S3UploadState,
  AnalysisState,
  MLRunResult,
  ForensicAnalysisResult,
} from "./types";

interface AnalyzeWorkspaceProps {
  userInitial?: string;
  userDisplayName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapter: maps the ML backend response to the UI ForensicAnalysisResult shape
// ─────────────────────────────────────────────────────────────────────────────

function toForensicResult(
  mlResult: MLRunResult,
  analysisId: string,
  originalImageUrl: string,
  elapsedSeconds: number
): ForensicAnalysisResult {
  const riskPct = Math.round(mlResult.risk_score * 100);
  const ev = mlResult.evidence;

  // Map ML verdict → UI labels
  const verdictMap: Record<
    string,
    { label: string; description: string; verdict: ForensicAnalysisResult["verdict"] }
  > = {
    forged: {
      verdict: "likely_manipulated",
      label: "Likely Manipulated",
      description:
        "Strong evidence of digital manipulation detected across multiple forensic channels. " +
        "The model identified suspicious pixel patterns inconsistent with an authentic image.",
    },
    authentic: {
      verdict: "authentic",
      label: "Appears Authentic",
      description:
        "No significant evidence of manipulation found. The image is consistent with " +
        "an unmodified photograph across all forensic channels.",
    },
    inconclusive: {
      verdict: "suspicious",
      label: "Inconclusive",
      description:
        "Mixed signals detected. Some forensic channels indicate possible manipulation " +
        "but evidence is not strong enough for a definitive verdict.",
    },
  };

  const mapped = verdictMap[mlResult.verdict] ?? verdictMap.inconclusive;

  // Generate a brief AI explanation from the scores
  const compScore = Math.round((ev.compression ?? 0) * 100);
  const freqNoiseScore = Math.round(((ev.noise_residual + ev.frequency_dct) / 2) * 100);
  const statsScore = Math.round(ev.local_statistics * 100);
  const elaScore = Math.round(ev.ela * 100);
  const metaScore = Math.round((ev.metadata ?? 0) * 100);
  const frac = (mlResult.localization.forgery_pixel_fraction * 100).toFixed(1);
  const conf = Math.round(mlResult.confidence * 100);

  const aiExplanation =
    `The forensic model computed an overall forgery risk score of ${riskPct}% ` +
    `with approximately ${frac}% of image area flagged as suspicious pixels. ` +
    `Diagnostic forensic evidence channels recorded: compression (${compScore}%), ` +
    `frequency/noise (${freqNoiseScore}%), local statistics (${statsScore}%), ` +
    `error level analysis (ELA) (${elaScore}%), and metadata (${metaScore}%). ` +
    `Model certainty: ${conf}%.`;

  return {
    verdict: mapped.verdict,
    verdictLabel: mapped.label,
    verdictDescription: mapped.description,
    forgeryRiskScore: riskPct,
    proposedRiskScore: riskPct,
    confidence: conf,
    mpcRiskScore: Math.round(mlResult.mpc_risk_score * 100),
    forgeryPixelFraction: Math.round(mlResult.localization.forgery_pixel_fraction * 100),
    evidence: {
      compression: compScore,
      frequencyNoise: freqNoiseScore,
      statistics: statsScore,
      ela: elaScore,
      metadata: metaScore,
      noise: Math.round(ev.noise_residual * 100),
      frequency: Math.round(ev.frequency_dct * 100),
    },
    aiExplanation,
    originalImageUrl,
    localizationMapUrl: mlResult.localization.overlay_url ?? "",
    elapsedSeconds,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main workspace component
// ─────────────────────────────────────────────────────────────────────────────

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

  /** Analysis pipeline phase state (after upload is done) */
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    phase: "idle",
    analysisId: null,
    errorMessage: null,
  });

  /** Final forensic result once the ML pipeline completes */
  const [forensicResult, setForensicResult] =
    useState<ForensicAnalysisResult | null>(null);

  // ── Derived booleans ──────────────────────────────────────────────────────
  const isUploading =
    uploadState.status === "requesting" || uploadState.status === "uploading";
  const isAnalyzing =
    analysisState.phase === "creating_record" ||
    analysisState.phase === "analyzing";
  const isProcessing = isUploading || isAnalyzing;
  const uploadError = uploadState.status === "error";
  const analysisError = analysisState.phase === "error";

  /**
   * Map the current pipeline state to the AnalysisProgress stage label.
   * "uploading"  → during S3 upload
   * "analyzing"  → record created / initializing
   * "generating" → FastAPI running
   * "finishing"  → complete
   */
  const currentStage: "uploading" | "analyzing" | "generating" | "finishing" =
    isUploading
      ? "uploading"
      : analysisState.phase === "creating_record"
        ? "analyzing"
        : analysisState.phase === "analyzing"
          ? "generating"
          : "finishing";

  // ── Overall progress value to show on the unified progress bar ────────────
  const overallProgress = isUploading
    ? Math.min(25, Math.max(5, Math.round(5 + (uploadState.progress / 100) * 20)))
    : analysisState.phase === "creating_record"
      ? 35
      : analysisState.phase === "analyzing"
        ? 70
        : 100;

  // ── Main handler ─────────────────────────────────────────────────────────
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
    const startTime = Date.now();

    // Reset any previous analysis
    setForensicResult(null);
    setAnalysisState({ phase: "idle", analysisId: null, errorMessage: null });

    // ── Step 1: Request a presigned URL ────────────────────────────────────
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
        } catch { /* ignore */ }
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

    // ── Step 2: Upload directly from browser to S3 ─────────────────────────
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
            ? "Upload failed. Please ensure S3 bucket CORS permissions are configured."
            : `Upload to secure storage failed: ${detail}`,
      });
      return;
    }

    setUploadState({ status: "complete", progress: 100, s3Key, errorMessage: null });

    // ── Step 3: Create MongoDB record ──────────────────────────────────────
    setAnalysisState({ phase: "creating_record", analysisId: null, errorMessage: null });

    let analysisId: string;

    try {
      const res = await fetch("/api/analyze/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!res.ok) {
        let msg = "Failed to create analysis record. Please try again.";
        try {
          const json = await res.json();
          if (typeof json?.error === "string") msg = json.error;
        } catch { /* ignore */ }
        setAnalysisState({ phase: "error", analysisId: null, errorMessage: msg });
        return;
      }

      const json = await res.json();
      analysisId = json.analysisId;
    } catch {
      setAnalysisState({
        phase: "error",
        analysisId: null,
        errorMessage: "Network error while initialising the analysis. Please try again.",
      });
      return;
    }

    // ── Step 4: Call /api/analyze/run → FastAPI → MongoDB ─────────────────
    setAnalysisState({ phase: "analyzing", analysisId, errorMessage: null });

    try {
      const res = await fetch("/api/analyze/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, s3Key }),
      });

      if (!res.ok) {
        let msg = "ML analysis failed. Please try again.";
        try {
          const json = await res.json();
          if (typeof json?.error === "string") msg = json.error;
        } catch { /* ignore */ }
        setAnalysisState({ phase: "error", analysisId, errorMessage: msg });
        return;
      }

      const json = await res.json() as { success: boolean; result: MLRunResult };

      if (!json.success || !json.result) {
        setAnalysisState({
          phase: "error",
          analysisId,
          errorMessage: "ML backend returned an unexpected response.",
        });
        return;
      }

      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
      const result = toForensicResult(
        json.result,
        analysisId,
        selectedImage.previewUrl,
        elapsedSeconds
      );

      setForensicResult(result);
      setAnalysisState({ phase: "complete", analysisId, errorMessage: null });
    } catch {
      setAnalysisState({
        phase: "error",
        analysisId,
        errorMessage:
          "Network error while running the analysis. Ensure the ML backend is running on port 8001.",
      });
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setUploadState({ status: "idle", progress: 0, s3Key: null, errorMessage: null });
    setAnalysisState({ phase: "idle", analysisId: null, errorMessage: null });
    setForensicResult(null);
  };

  const anyError = uploadError || analysisError;
  const errorMessage =
    uploadState.errorMessage ?? analysisState.errorMessage ?? null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Utility Nav Bar with Back Link and Profile */}
      <TopNavBar
        userInitial={userInitial}
        userDisplayName={userDisplayName}
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      {/* Page Header (hidden when results card is active to preserve viewport height) */}
      {!forensicResult && (
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Analyze an Image
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-3xl">
            Upload an image to perform deep multi-evidence forensic analysis and uncover the truth behind its pixels.
          </p>
        </div>
      )}

      {/* 1. Upload Card & Selected Image Preview */}
      {/* Hide the uploader once we have a result or are mid-processing */}
      {!forensicResult && !isProcessing && (
        <ImageUpload
          onImageSelected={(img) => {
            setSelectedImage(img);
            setUploadState({ status: "idle", progress: 0, s3Key: null, errorMessage: null });
            setAnalysisState({ phase: "idle", analysisId: null, errorMessage: null });
            setForensicResult(null);
          }}
          selectedImage={selectedImage}
          onClearImage={handleClearImage}
          onStartAnalysis={handleStartAnalysis}
          isAnalyzing={isProcessing}
          uploadState={uploadState}
        />
      )}

      {/* 2. Unified Analysis Progress (Directly entered upon clicking Start Analysis) */}
      {!forensicResult && isProcessing && (
        <AnalysisProgress
          progress={overallProgress}
          currentStage={currentStage}
          label="Analyzing your image..."
          subtitle="The forensic AI model is examining pixel patterns, noise residuals, DCT frequencies, and ELA. This may take up to 60 seconds."
        />
      )}

      {/* 3. Error State (upload or analysis) */}
      {anyError && errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200/80 rounded-xl text-xs sm:text-sm text-red-800 animate-fade-in">
          <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1 space-y-2">
            <p className="font-medium">{errorMessage}</p>
            <button
              type="button"
              onClick={handleClearImage}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 underline underline-offset-2"
            >
              Try again with a different image
            </button>
          </div>
        </div>
      )}

      {/* 4. Forensic Analysis Results */}
      {forensicResult && (
        <AnalysisResults
          results={forensicResult}
          onAnalyzeAnother={handleClearImage}
        />
      )}

      {/* 5. How PIXENTRA Works (hidden while analysis is running or result is shown) */}
      {!isProcessing && !forensicResult && !anyError && (
        <HowItWorks />
      )}

      {/* 6. Privacy Reassurance Banner */}
      {!isProcessing && !forensicResult && (
        <PrivacyCard />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// S3 upload helper — uses XHR for real byte-level progress reporting
// ─────────────────────────────────────────────────────────────────────────────

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
