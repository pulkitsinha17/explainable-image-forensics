import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    plan: {
      type: String,
      enum: ["free", "monthly", "yearly"],
      default: "free",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "past_due"],
      default: "active",
      required: true,
    },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date },
    // Reserved for future Razorpay integration
    razorpayCustomerId: { type: String },
    razorpaySubscriptionId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

export type SubscriptionDocument = InferSchemaType<typeof SubscriptionSchema>;

const Subscription: Model<SubscriptionDocument> =
  (mongoose.models.Subscription as Model<SubscriptionDocument>) ||
  mongoose.model<SubscriptionDocument>("Subscription", SubscriptionSchema);

export default Subscription;
