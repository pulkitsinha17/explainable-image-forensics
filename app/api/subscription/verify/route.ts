import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import {
  getRazorpayClient,
  getPlanFromRazorpayPlanId,
  verifySubscriptionSignature,
} from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to verify subscription." },
        { status: 401 }
      );
    }

    let body: {
      razorpay_payment_id?: unknown;
      razorpay_subscription_id?: unknown;
      razorpay_signature?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const {
      razorpay_payment_id: paymentId,
      razorpay_subscription_id: subscriptionId,
      razorpay_signature: signature,
    } = body;

    if (
      typeof paymentId !== "string" ||
      typeof subscriptionId !== "string" ||
      typeof signature !== "string" ||
      !paymentId ||
      !subscriptionId ||
      !signature
    ) {
      return NextResponse.json(
        { error: "Missing required Razorpay payment verification parameters." },
        { status: 400 }
      );
    }

    // 1. Verify HMAC-SHA256 signature server-side
    const isSignatureValid = verifySubscriptionSignature({
      payment_id: paymentId,
      subscription_id: subscriptionId,
      signature: signature,
    });

    if (!isSignatureValid) {
      console.error("[subscription/verify] Signature mismatch for:", {
        paymentId,
        subscriptionId,
      });
      return NextResponse.json(
        { error: "Payment verification failed: Invalid digital signature." },
        { status: 400 }
      );
    }

    // 2. Fetch authoritative subscription state directly from Razorpay API
    const razorpay = getRazorpayClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzpSub: any = await razorpay.subscriptions.fetch(subscriptionId);

    if (!rzpSub) {
      return NextResponse.json(
        { error: "Subscription record not found on Razorpay." },
        { status: 404 }
      );
    }

    // 3. Confirm ownership: subscription notes clerkUserId must match current user
    const subOwnerUserId = rzpSub.notes?.clerkUserId;
    if (subOwnerUserId && subOwnerUserId !== userId) {
      console.error("[subscription/verify] User mismatch:", {
        subOwnerUserId,
        authenticatedUserId: userId,
      });
      return NextResponse.json(
        { error: "Subscription does not belong to the current authenticated account." },
        { status: 403 }
      );
    }

    // 4. Resolve plan tier from plan ID or notes
    const resolvedPlan: "monthly" | "yearly" =
      getPlanFromRazorpayPlanId(rzpSub.plan_id) ||
      (rzpSub.notes?.plan as "monthly" | "yearly") ||
      "monthly";

    // Period calculation
    const periodStart = rzpSub.current_start
      ? new Date(rzpSub.current_start * 1000)
      : new Date();

    const periodEnd = rzpSub.current_end
      ? new Date(rzpSub.current_end * 1000)
      : new Date(Date.now() + (resolvedPlan === "monthly" ? 30 : 365) * 86400000);

    const subscriptionStatus =
      rzpSub.status === "active" || rzpSub.status === "authenticated"
        ? "active"
        : rzpSub.status;

    // 5. Persist to MongoDB
    await connectToDatabase();
    const updatedSub = await Subscription.findOneAndUpdate(
      { clerkUserId: userId },
      {
        $set: {
          plan: resolvedPlan,
          status: subscriptionStatus,
          razorpaySubscriptionId: rzpSub.id,
          razorpayPaymentId: paymentId,
          razorpayCustomerId: rzpSub.customer_id || undefined,
          razorpayPlanId: rzpSub.plan_id,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Subscription payment verified and activated successfully.",
      subscription: {
        plan: updatedSub.plan,
        status: updatedSub.status,
        currentPeriodStart: updatedSub.currentPeriodStart,
        currentPeriodEnd: updatedSub.currentPeriodEnd,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[subscription/verify] Error:", error);
    return NextResponse.json(
      { error: message || "Failed to verify subscription." },
      { status: 500 }
    );
  }
}
