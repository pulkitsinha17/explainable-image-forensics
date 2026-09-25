export interface SelectedImageData {
  file?: File;
  previewUrl: string;
  name: string;
  sizeFormatted: string;
  dimensions: string;
  format: string;
}

export interface ForensicEvidence {
  compression: number;       // Compression evidence e.g. 75%
  frequencyNoise: number;    // Frequency / Noise evidence e.g. 68%
  statistics: number;        // Local Statistics evidence e.g. 68%
  ela: number;               // Error Level Analysis (ELA) e.g. 83%
  metadata: number;          // Metadata evidence e.g. 0%
  spatial?: number;
  noise?: number;
  frequency?: number;
}

export interface ForensicAnalysisResult {
  verdict: "manipulated" | "authenticated" | "inconclusive" | "likely_manipulated" | "authentic" | "suspicious";
  verdictLabel: string;
  verdictDescription: string;
  forgeryRiskScore: number; // 0 - 100 (kept for compatibility)
  manipulationProbability?: number; // 0 - 100
  authenticityProbability?: number; // 0 - 100
  predictionCertainty?: number; // 0 - 100
  forensicManipulationScore?: number; // 0 - 100
  forensicAuthenticityScore?: number; // 0 - 100
  classifierVerdict?: string;
  hybridVerdict?: string;
  localizationSupport?: boolean;
  localizationSupportReason?: string;
  /** Proposed StrongMultiEvidenceNet model risk score (0–100) */
  proposedRiskScore: number;
  /** Confidence of the model (0–100) */
  confidence: number;
  /** MPC baseline backbone risk score (0–100) */
  mpcRiskScore: number;
  /** Fraction of pixels predicted as forged (0–100) */
  forgeryPixelFraction: number;
  evidence: ForensicEvidence;
  aiExplanation: string;
  originalImageUrl: string;
  localizationMapUrl: string;
  maskMapUrl?: string;
  analysisId?: string;
  imageMetadata?: {
    name?: string;
    dimensions?: string;
    sizeFormatted?: string;
    format?: string;
  };
  elapsedSeconds: number;
}

/**
 * Tracks the state of the S3 upload phase.
 * This is SEPARATE from the forensic analysis phase.
 */
export type S3UploadStatus =
  | "idle"           // No upload in progress
  | "requesting"     // Requesting presigned URL from server
  | "uploading"      // Browser is PUT-ing the file to S3
  | "complete"       // S3 upload succeeded; s3Key is available
  | "error";         // Upload failed; see errorMessage

export interface S3UploadState {
  status: S3UploadStatus;
  progress: number;  // 0–100, upload byte progress
  s3Key: string | null;
  errorMessage: string | null;
}

/**
 * Tracks the phase of the full analysis pipeline
 * (after S3 upload is complete).
 */
export type AnalysisPhase =
  | "idle"
  | "creating_record"  // POST /api/analyze/record
  | "analyzing"        // POST /api/analyze/run → FastAPI
  | "complete"
  | "error";

export interface AnalysisState {
  phase: AnalysisPhase;
  analysisId: string | null;
  errorMessage: string | null;
}

/**
 * The sanitised response from POST /api/analyze/run
 * (filesystem paths are stripped server-side).
 */
export interface MLRunResult {
  verdict: string;
  risk_score: number;             // 0.0–1.0
  manipulation_probability?: number; // 0.0–1.0
  authenticity_probability?: number; // 0.0–1.0
  prediction_certainty?: number;     // 0.0–1.0
  forensic_manipulation_score?: number; // 0.0–1.0
  forensic_authenticity_score?: number; // 0.0–1.0
  classifier_verdict?: string;
  hybrid_verdict?: string;
  localization_support?: boolean;
  localization_support_reason?: string;
  proposed_risk_score?: number;   // 0.0–1.0
  confidence: number;             // 0.0–1.0
  mpc_risk_score: number;         // 0.0–1.0
  decision_threshold?: number;
  inconclusive_threshold?: number;
  evidence: {
    compression?: number;
    noise_residual: number;
    frequency_dct: number;
    ela: number;
    local_statistics: number;
    metadata?: number;
  };
  localization: {
    forgery_pixel_fraction: number;
    overlay_url: string | null;  // /api/analyze/mask/{analysisId}
    mask_url?: string | null;     // /api/analyze/mask/{analysisId}?type=mask
  };
}
