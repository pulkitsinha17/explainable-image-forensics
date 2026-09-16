import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AnalysisSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    originalFilename: { type: String, required: true },
    /** S3 key of the uploaded original image */
    s3Key: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      required: true,
    },
    detectionResult: {
      type: String,
      enum: ["authentic", "forged", "inconclusive"],
    },
    /** risk_score from ML backend (0.0–1.0) */
    forgeryRiskScore: { type: Number, min: 0, max: 1 },
    /** proposed_risk_score from ML backend (0.0–1.0) */
    proposedRiskScore: { type: Number, min: 0, max: 1 },
    /** confidence from ML backend (0.0–1.0) */
    confidence: { type: Number, min: 0, max: 1 },
    /** mpc_risk_score from ML backend (0.0–1.0) */
    mpcRiskScore: { type: Number, min: 0, max: 1 },
    /** Structured localization summary (forgery_pixel_fraction, etc.) */
    localizationResult: { type: Schema.Types.Mixed },
    /** Per-channel evidence scores from ML backend */
    evidenceResults: { type: Schema.Types.Mixed },
    /**
     * Server-side filesystem path to the generated overlay PNG.
     * NEVER sent to the browser — used only by /api/analyze/mask/[analysisId].
     */
    overlayPath: { type: String },
    /**
     * Server-side filesystem path to the generated binary mask PNG.
     * NEVER sent to the browser.
     */
    maskPath: { type: String },
    /** Full raw ML response — stored for debugging, not sent to clients */
    mlRawResult: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export type AnalysisDocument = InferSchemaType<typeof AnalysisSchema>;

const Analysis: Model<AnalysisDocument> =
  (mongoose.models.Analysis as Model<AnalysisDocument>) ||
  mongoose.model<AnalysisDocument>("Analysis", AnalysisSchema);

export default Analysis;

