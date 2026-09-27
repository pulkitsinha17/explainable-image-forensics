import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SettingsNav } from "@/components/settings/settings-nav";

export const dynamic = "force-dynamic";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0B0B0B] text-gray-900 dark:text-gray-100 flex flex-col lg:flex-row antialiased">
      {/* Desktop & Mobile Responsive PIXENTRA Sidebar */}
      <DashboardSidebar
        user={{
          displayName,
          email: userEmail,
          imageUrl: userImageUrl,
        }}
      />

      {/* Main Settings Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto space-y-6 animate-fade-in">
          {/* Top Back Link & Heading Section */}
          <div className="space-y-2 pb-1 border-b border-gray-100 dark:border-slate-800">
            {/* Back to Dashboard Link */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Dashboard</span>
            </Link>

            {/* Title and Subtitle */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Account Settings
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Manage your PIXENTRA profile, authentication, subscription plan, and usage quota.
              </p>
            </div>
          </div>

          {/* ONE SINGLE LARGE UNIFIED SETTINGS CONTAINER */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-gray-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col lg:flex-row items-stretch">
            {/* Left Column: Full-Height Very Light Grey Navigation */}
            <SettingsNav />

            {/* Right Column: Clean White Selected Content Area */}
            <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 p-6 sm:p-8 lg:p-9">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

