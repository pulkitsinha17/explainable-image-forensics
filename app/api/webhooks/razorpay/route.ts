import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import {
  getPlanFromRazorpayPlanId,
  verifyWebhookSignatureHeader,
} from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // 1. Verify webhook signature
    const isValid = verifyWebhookSignatureHeader(rawBody, signature);
    if (!isValid) {
      console.error("[Razorpay Webhook] Invalid signature from IP:", req.headers.get("x-forwarded-for"));
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    // 2. Parse event payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventType: string = event.event;
    console.log(`[Razorpay Webhook] Received event: ${eventType} (ID: ${event.id || "n/a"})`);

    const subEntity = event.payload?.subscription?.entity;
    const paymentEntity = event.payload?.payment?.entity;

    // If event does not pertain to subscriptions, acknowledge and return 200
    if (!subEntity || !subEntity.id) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const subscriptionId: string = subEntity.id;
    const planId: string | undefined = subEntity.plan_id;
    const notesClerkUserId: string | undefined = subEntity.notes?.clerkUserId;

    await connectToDatabase();

    // 3. Find the subscription document by razorpaySubscriptionId or notes.clerkUserId
    let subscriptionDoc = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionId,
    });

    if (!subscriptionDoc && notesClerkUserId) {
      subscriptionDoc = await Subscription.findOne({
        clerkUserId: notesClerkUserId,
      });
    }

    // If not found in DB at all, upsert if we have clerkUserId in notes
    if (!subscriptionDoc && notesClerkUserId) {
      subscriptionDoc = await Subscription.create({
        clerkUserId: notesClerkUserId,
        plan: "free",
        status: "active",
        razorpaySubscriptionId: subscriptionId,
      });
    }

    if (!subscriptionDoc) {
      console.warn(
        `[Razorpay Webhook] No matching Subscription found for rzpSub: ${subscriptionId}, notes.clerkUserId: ${notesClerkUserId}`
      );
      // Return 200 to acknowledge webhook so Razorpay doesn't keep hammering retries
      return NextResponse.json({ received: true, warning: "User not found" });
    }

    // 4. Resolve plan tier
    const resolvedPlan =
      getPlanFromRazorpayPlanId(planId) ||
      (subEntity.notes?.plan as "monthly" | "yearly") ||
      (subscriptionDoc.plan !== "free" ? subscriptionDoc.plan : "monthly");

    const periodStart = subEntity.current_start
      ? new Date(subEntity.current_start * 1000)
      : subscriptionDoc.currentPeriodStart || new Date();

    const periodEnd = subEntity.current_end
      ? new Date(subEntity.current_end * 1000)
      : new Date(Date.now() + (resolvedPlan === "monthly" ? 30 : 365) * 86400000);

    const now = new Date();

    // 5. Handle subscription event states
    switch (eventType) {
      case "subscription.authenticated":
        await Subscription.findByIdAndUpdate(subscriptionDoc._id, {
          $set: {
            plan: resolvedPlan,
            status: "authenticated",
            razorpaySubscriptionId: subscriptionId,
            razorpayPlanId: planId,
            razorpayCustomerId: subEntity.customer_id || undefined,
            lastWebhookEvent: eventType,
            lastWebhookAt: now,
          },
        });
        break;

      case "subscription.activated":
        await Subscription.findByIdAndUpdate(subscriptionDoc._id, {
          $set: {
            plan: resolvedPlan,
            status: "active",
            razorpaySubscriptionId: subscriptionId,
            razorpayPlanId: planId,
            razorpayCustomerId: subEntity.customer_id || undefined,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            lastWebhookEvent: eventType,
            lastWebhookAt: now,
          },
        });
        break;

      case "subscription.charged": {
        // Successful payment / recurring renewal!
        // Updating currentPeriodStart is key: resets the analysis usage quota for this new period!
        const paymentId = paymentEntity?.id || subEntity.payment_id || subscriptionDoc.razorpayPaymentId;

        await Subscription.findByIdAndUpdate(subscriptionDoc._id, {
          $set: {
            plan: resolvedPlan,
            status: "active",
            razorpaySubscriptionId: subscriptionId,
            razorpayPaymentId: paymentId,
            razorpayPlanId: planId,
            razorpayCustomerId: subEntity.customer_id || undefined,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            lastWebhookEvent: eventType,
            lastWebhookAt: now,
          },
        });
        break;
      }

      case "subscription.pending":
        await Subscription.findByIdAndUpdate(subscriptionDoc._id, {
          $set: {
            status: "pending",
            lastWebhookEvent: eventType,
            lastWebhookAt: now,
          },
        });
        break;

      case "subscription.halted":
        // All retries failed — customer's card/mandate failed. Access is halted.
        await Subscription.findByIdAndUpdate(subscriptionDoc._id, {
          $set: {
            status: "halted",
            lastWebhookEvent: eventType,
            lastWebhookAt: now,
          },
        });
        break;

      case "subscription.cancelled": {
        const endedAtDate = subEntity.ended_at
          ? new Date(subEntity.ended_at * 1000)
          : now;

        await Subscription.findByIdAndUpdate(subscriptionDoc._id, {
          $set: {
            status: "cancelled",
            cancelledAt: now,
            endedAt: endedAtDate,
            lastWebhookEvent: eventType,
            lastWebhookAt: now,
          },
        });
        break;
      }

      case "subscription.paused":
        await Subscription.findByIdAndUpdate(subscriptionDoc._id, {
          $set: {
            status: "paused",
            lastWebhookEvent: eventType,
            lastWebhookAt: now,
          },
        });
        break;

      case "subscription.resumed":
        await Subscription.findByIdAndUpdate(subscriptionDoc._id, {
          $set: {
            status: "active",
            lastWebhookEvent: eventType,
            lastWebhookAt: now,
          },
        });
        break;

      case "payment.failed":
        console.warn(
          `[Razorpay Webhook] Payment failed on subscription: ${subscriptionId}, payment: ${paymentEntity?.id}`
        );
        await Subscription.findByIdAndUpdate(subscriptionDoc._id, {
          $set: {
            lastWebhookEvent: eventType,
            lastWebhookAt: now,
          },
        });
        break;

      default:
        // Record any other subscription event for audit
        await Subscription.findByIdAndUpdate(subscriptionDoc._id, {
          $set: {
            lastWebhookEvent: eventType,
            lastWebhookAt: now,
          },
        });
        break;
    }

    return NextResponse.json({ received: true, event: eventType });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[Razorpay Webhook] Unhandled error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
