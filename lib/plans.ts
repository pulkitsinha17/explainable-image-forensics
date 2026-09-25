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
