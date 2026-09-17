import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const FeedbackSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, index: true },
    analysisId: { type: String, required: true, index: true },
    rating: {
      type: String,
      enum: ["useful", "not_useful"],
      required: true,
    },
    comment: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one feedback per user per analysis (upsert pattern)
FeedbackSchema.index({ clerkUserId: 1, analysisId: 1 }, { unique: true });

export type FeedbackDocument = InferSchemaType<typeof FeedbackSchema>;

const Feedback: Model<FeedbackDocument> =
  (mongoose.models.Feedback as Model<FeedbackDocument>) ||
  mongoose.model<FeedbackDocument>("Feedback", FeedbackSchema);

export default Feedback;
