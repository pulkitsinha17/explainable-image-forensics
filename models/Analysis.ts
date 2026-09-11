import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AnalysisSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    originalFilename: { type: String, required: true },
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
    forgeryRiskScore: { type: Number, min: 0, max: 1 },
    localizationResult: { type: Schema.Types.Mixed },
    evidenceResults: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export type AnalysisDocument = InferSchemaType<typeof AnalysisSchema>;

const Analysis: Model<AnalysisDocument> =
  (mongoose.models.Analysis as Model<AnalysisDocument>) ||
  mongoose.model<AnalysisDocument>("Analysis", AnalysisSchema);

export default Analysis;
