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
