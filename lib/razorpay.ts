import Razorpay from "razorpay";
import crypto from "crypto";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";

/**
 * Returns an authenticated Razorpay SDK instance.
 * Throws a descriptive error if environment variables are missing.
 */
export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing. Please define RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Returns the server-configured Razorpay plan ID for the given tier.
 * Only 'monthly' and 'yearly' are valid subscription plans.
 */
export function getRazorpayPlanId(plan: "monthly" | "yearly"): string {
  if (plan === "monthly") {
    const planId = process.env.RAZORPAY_MONTHLY_PLAN_ID;
    if (!planId) {
      throw new Error(
        "RAZORPAY_MONTHLY_PLAN_ID is not configured in environment variables."
      );
    }
    return planId;
  }

  if (plan === "yearly") {
    const planId = process.env.RAZORPAY_YEARLY_PLAN_ID;
    if (!planId) {
      throw new Error(
        "RAZORPAY_YEARLY_PLAN_ID is not configured in environment variables."
      );
    }
    return planId;
  }

  throw new Error(`Unsupported subscription plan tier: ${plan}`);
}

/**
 * Resolves the plan tier ("monthly" | "yearly") from a Razorpay plan ID.
 */
export function getPlanFromRazorpayPlanId(
  planId: string | null | undefined
): "monthly" | "yearly" | null {
  if (!planId) return null;
  if (planId === process.env.RAZORPAY_MONTHLY_PLAN_ID) {
    return "monthly";
  }
  if (planId === process.env.RAZORPAY_YEARLY_PLAN_ID) {
    return "yearly";
  }
  return null;
}

/**
 * Verifies the subscription payment signature returned by Razorpay Checkout.
 * Official Razorpay subscription signature payload format:
 *   payload = razorpay_payment_id + '|' + razorpay_subscription_id
 * HMAC-SHA256 hashed with RAZORPAY_KEY_SECRET.
 */
export function verifySubscriptionSignature(params: {
  payment_id: string;
  subscription_id: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error("[Razorpay] Missing RAZORPAY_KEY_SECRET for signature verification");
    return false;
  }

  try {
    return validatePaymentVerification(
      {
        payment_id: params.payment_id,
        subscription_id: params.subscription_id,
      },
      params.signature,
      secret
    );
  } catch (err) {
    console.error("[Razorpay] Subscription signature verification threw an error:", err);
    return false;
  }
}

/**
 * Verifies Razorpay webhook signatures using raw request body and RAZORPAY_WEBHOOK_SECRET.
 * Uses timingSafeEqual to guard against timing attacks.
 */
export function verifyWebhookSignatureHeader(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured");
    return false;
  }
  if (!signatureHeader) {
    console.warn("[Razorpay Webhook] Missing x-razorpay-signature header");
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const signatureBuffer = Buffer.from(signatureHeader, "utf8");

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.error("[Razorpay Webhook] Error during webhook signature verification:", err);
    return false;
  }
}
