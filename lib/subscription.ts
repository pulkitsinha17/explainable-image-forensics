import { connectToDatabase } from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import Subscription from "@/models/Subscription";

export type PlanTier = "free" | "monthly" | "yearly";

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  price: string;
  priceAmount: number;
  period: string;
  periodLabel: string;
  tagline: string;
  limit: number;
  badge: string | null;
  highlighted: boolean;
  savings?: string;
  features: string[];
}

export const PLAN_DEFINITIONS: Record<PlanTier, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    price: "₹0",
    priceAmount: 0,
    period: "",
    periodLabel: "Total",
    tagline: "For getting started",
    limit: 5,
    badge: null,
    highlighted: false,
    features: [
      "5 forensic image analyses included",
      "Full multi-evidence analysis & explainable AI",
      "Forgery localization heatmaps & masks",
      "Frequency, noise, ELA & statistical evidence",
      "Detailed PDF forensic report generation",
      "Analysis history access",
    ],
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    price: "₹199",
    priceAmount: 199,
    period: "/ month",
    periodLabel: "per month",
    tagline: "For regular analysis",
    limit: 25,
    badge: "RECOMMENDED",
    highlighted: true,
    features: [
      "25 forensic image analyses per month",
      "Full multi-evidence analysis & explainable AI",
      "Forgery localization heatmaps & masks",
      "Frequency, noise, ELA & statistical evidence",
      "Detailed PDF forensic report generation",
      "Analysis history access",
      "Standard priority processing",
    ],
  },
  yearly: {
    id: "yearly",
    name: "Yearly",
    price: "₹1,999",
    priceAmount: 1999,
    period: "/ year",
    periodLabel: "per year",
    tagline: "For long-term use",
    limit: 300,
    badge: "BEST VALUE",
    highlighted: false,
    savings: "Save ₹389 compared to monthly billing",
    features: [
      "300 forensic image analyses per year",
      "Save ₹389 compared to monthly billing",
      "Full multi-evidence analysis & explainable AI",
      "Forgery localization heatmaps & masks",
      "Frequency, noise, ELA & statistical evidence",
      "Detailed PDF forensic report generation",
      "Analysis history access",
      "Priority feature access",
    ],
  },
};

export interface UserUsageInfo {
  plan: PlanTier;
  planName: string;
  status: string;
  price: string;
  periodLabel: string;
  used: number;
  limit: number;
  remaining: number;
  isLimitReached: boolean;
  percentage: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
}

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
