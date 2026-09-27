import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import Subscription from "@/models/Subscription";
import {
  PlanTier,
  PLAN_DEFINITIONS,
  UserUsageInfo,
} from "@/lib/plans";

export * from "@/lib/plans";

export async function getUserUsageAndLimit(clerkUserId: string): Promise<UserUsageInfo> {
  await connectToDatabase();

  const subscriptionDoc = await Subscription.findOne({ clerkUserId }).lean();
  
  const planTier = (subscriptionDoc?.plan as PlanTier) || "free";
  const planDef = PLAN_DEFINITIONS[planTier] || PLAN_DEFINITIONS.free;
  const limit = planDef.limit;

  let used = 0;
  if (planTier === "free") {
    // Free plan: 5 analyses total (count all non-failed analyses initiated by this user)
    used = await Analysis.countDocuments({
      clerkUserId,
      status: { $in: ["completed", "processing", "pending"] },
    });
  } else {
    // Monthly / Yearly plans: count analyses in current billing cycle
    const periodStart = subscriptionDoc?.currentPeriodStart
      ? new Date(subscriptionDoc.currentPeriodStart)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    used = await Analysis.countDocuments({
      clerkUserId,
      createdAt: { $gte: periodStart },
      status: { $in: ["completed", "processing", "pending"] },
    });
  }

  const isDev = process.env.NODE_ENV === "development";
  const remaining = Math.max(0, limit - used);
  const isLimitReached = isDev ? false : used >= limit;
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
  };
}
