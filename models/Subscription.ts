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
      enum: [
        "active",
        "authenticated",
        "created",
        "pending",
        "halted",
        "cancelled",
        "completed",
        "expired",
        "paused",
        "inactive",
        "past_due",
      ],
      default: "active",
      required: true,
    },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date },
    // Razorpay Subscription integration fields
    razorpayCustomerId: { type: String },
    razorpaySubscriptionId: { type: String, index: true, sparse: true },
    razorpayPaymentId: { type: String },
    razorpayPlanId: { type: String },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    endedAt: { type: Date },
    lastWebhookEvent: { type: String },
    lastWebhookAt: { type: Date },
  },
  { timestamps: true }
);

export type SubscriptionDocument = InferSchemaType<typeof SubscriptionSchema>;

const Subscription: Model<SubscriptionDocument> =
  (mongoose.models.Subscription as Model<SubscriptionDocument>) ||
  mongoose.model<SubscriptionDocument>("Subscription", SubscriptionSchema);

export default Subscription;
