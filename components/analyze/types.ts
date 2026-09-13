export interface SelectedImageData {
  file?: File;
  previewUrl: string;
  name: string;
  sizeFormatted: string;
  dimensions: string;
  format: string;
}

export interface ForensicEvidence {
  spatial: number;     // e.g. 87%
  noise: number;       // e.g. 71%
  frequency: number;   // e.g. 79%
  ela: number;         // e.g. 83%
  statistics: number;  // e.g. 68%
  metadata: number;    // e.g. 32%
}

export interface ForensicAnalysisResult {
  verdict: "likely_manipulated" | "authentic" | "suspicious";
  verdictLabel: string;
  verdictDescription: string;
  forgeryRiskScore: number; // 0 - 100
  evidence: ForensicEvidence;
  aiExplanation: string;
  originalImageUrl: string;
  localizationMapUrl: string;
  elapsedSeconds: number;
}

/**
 * Tracks the state of the S3 upload phase.
 * This is SEPARATE from the forensic analysis phase (Phase 3 / FastAPI).
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
