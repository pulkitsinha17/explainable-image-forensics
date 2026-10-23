import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import Subscription from "@/models/Subscription";
import {
  PlanTier,
  PLAN_DEFINITIONS,
  UserUsageInfo,
} from "@/lib/plans";
import { isDeveloperUser } from "@/lib/developer-access";

export * from "@/lib/plans";

/**
 * Determines whether a subscription document represents an active, valid paid plan.
 */
function isPaidSubscriptionValid(subscriptionDoc: {
  plan?: string | null;
  status?: string | null;
  currentPeriodEnd?: Date | string | null;
} | null | undefined): boolean {
  if (!subscriptionDoc) return false;

  const plan = subscriptionDoc.plan;
  if (plan !== "monthly" && plan !== "yearly") {
    return false;
  }

  // Active or authenticated (pending initial settlement) statuses are valid
  const status = subscriptionDoc.status;
  const isStatusActive = status === "active" || status === "authenticated";
  if (!isStatusActive) {
    return false;
  }

  // Check period expiration if currentPeriodEnd is specified (with 24h grace window for webhook processing)
  if (subscriptionDoc.currentPeriodEnd) {
    const periodEndMs = new Date(subscriptionDoc.currentPeriodEnd).getTime();
    const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;
    if (periodEndMs + GRACE_PERIOD_MS < Date.now()) {
      return false;
    }
  }

  return true;
}

export async function getUserUsageAndLimit(clerkUserId: string): Promise<UserUsageInfo> {
  await connectToDatabase();

  const subscriptionDoc = await Subscription.findOne({ clerkUserId }).lean();
  
  const hasValidPaidSub = isPaidSubscriptionValid(subscriptionDoc);
  const planTier: PlanTier = hasValidPaidSub
    ? ((subscriptionDoc?.plan as PlanTier) || "free")
    : "free";

  const planDef = PLAN_DEFINITIONS[planTier] || PLAN_DEFINITIONS.free;
  const limit = planDef.limit;

  let used = 0;
  if (planTier === "free") {
    // Free plan: 5 analyses lifetime quota (count all non-failed analyses initiated by this user)
    used = await Analysis.countDocuments({
      clerkUserId,
      status: { $in: ["completed", "processing", "pending"] },
    });
  } else {
    // Monthly / Yearly plans: count analyses in the current active billing cycle
    const periodStart = subscriptionDoc?.currentPeriodStart
      ? new Date(subscriptionDoc.currentPeriodStart)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    used = await Analysis.countDocuments({
      clerkUserId,
      createdAt: { $gte: periodStart },
      status: { $in: ["completed", "processing", "pending"] },
    });
  }

  // Developer quota exemption check (server-side, verified Clerk email)
  const isDeveloperUnlimited = await isDeveloperUser(clerkUserId);

  const remaining = isDeveloperUnlimited ? 999999 : Math.max(0, limit - used);
  const isLimitReached = isDeveloperUnlimited ? false : used >= limit;
  const percentage = Math.min(100, Math.round((used / limit) * 100));

  return {
    plan: planTier,
    planName: planDef.name,
    status: subscriptionDoc?.status || "active",
    price: planDef.price,
    periodLabel: planDef.periodLabel,
    used,
    limit,
    remaining,
    isLimitReached,
    percentage,
    currentPeriodStart: subscriptionDoc?.currentPeriodStart
      ? new Date(subscriptionDoc.currentPeriodStart).toISOString()
      : null,
    currentPeriodEnd: subscriptionDoc?.currentPeriodEnd
      ? new Date(subscriptionDoc.currentPeriodEnd).toISOString()
      : null,
    isDeveloper: isDeveloperUnlimited,
    isDeveloperUnlimited,
  };
}
