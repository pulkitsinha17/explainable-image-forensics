import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserAnalysisHistory } from "@/lib/history";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AnalysisCTA } from "@/components/dashboard/analysis-cta";
import { StatsGrid, type DashboardStats } from "@/components/dashboard/stats-grid";
import { RecentAnalyses, type RecentAnalysisItem } from "@/components/dashboard/recent-analyses";
import { OnboardingSteps } from "@/components/dashboard/onboarding-steps";
import { ForensicQuote } from "@/components/dashboard/forensic-quote";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const firstName =
    user?.firstName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "User";

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user?.username || firstName;

  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const userImageUrl = user?.imageUrl;

  // Fetch real statistics & recent analyses from canonical history source of truth
  let stats: DashboardStats = {
    totalAnalyses: 0,
    analysesThisMonth: 0,
    manipulatedDetected: 0,
    averageRiskScore: null,
  };

  let recentAnalyses: RecentAnalysisItem[] = [];

  try {
    const historyData = await getUserAnalysisHistory(userId);
    stats = {
      totalAnalyses: historyData.stats.totalAnalyses,
      analysesThisMonth: historyData.analysesThisMonth,
      manipulatedDetected: historyData.stats.potentiallyForgedCount,
      averageRiskScore:
        historyData.stats.completedCount > 0
          ? historyData.stats.averageRiskPercentage
          : null,
    };

    recentAnalyses = historyData.records.slice(0, 5);
  } catch (error) {
    // Fail gracefully with clean zero-state without crashing the dashboard
    console.warn("Dashboard analysis data fetch fallback:", error);
  }


  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 flex flex-col lg:flex-row antialiased">
      {/* Desktop & Mobile Responsive Sidebar */}
      <DashboardSidebar
        user={{
          displayName,
          email: userEmail,
          imageUrl: userImageUrl,
        }}
      />

      {/* Main Forensic Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6 animate-fade-in">
          {/* Top Header */}
          <DashboardHeader firstName={firstName} />

          {/* Primary Analysis CTA */}
          <AnalysisCTA />

          {/* Analytics Summary */}
          <StatsGrid stats={stats} />

          {/* Recent Analyses & Onboarding Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7">
              <RecentAnalyses analyses={recentAnalyses} />
            </div>
            <div className="lg:col-span-5">
              <OnboardingSteps />
            </div>
          </div>

          {/* Bottom Forensic Quote Banner */}
          <ForensicQuote />
        </main>
      </div>
    </div>
  );
}
