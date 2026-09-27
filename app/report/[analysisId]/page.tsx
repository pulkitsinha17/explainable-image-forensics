import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { ReportViewer } from "./report-viewer";

export const dynamic = "force-dynamic";

export default async function ViewReportPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { analysisId } = await params;

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

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0B0B0B] text-gray-900 dark:text-gray-100 flex flex-col lg:flex-row antialiased">
      {/* Desktop & Mobile Responsive Sidebar */}
      <DashboardSidebar
        user={{
          displayName,
          email: userEmail,
          imageUrl: userImageUrl,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto animate-fade-in">
          <Suspense fallback={<div className="p-8 text-center text-gray-500 dark:text-slate-400 text-sm">Loading forensic report...</div>}>
            <ReportViewer analysisId={analysisId} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
