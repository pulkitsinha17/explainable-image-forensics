import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { HistoryWorkspace } from "@/components/history/history-workspace";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const firstName =
    user?.firstName ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "Pulkit";

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user?.username || firstName;

  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const userImageUrl = user?.imageUrl;
  const userInitial = (displayName?.[0] || "P").toUpperCase();

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

      {/* Main History Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto animate-fade-in">
          <HistoryWorkspace
            userInitial={userInitial}
            userDisplayName={displayName}
          />
        </main>
      </div>
    </div>
  );
}
