import Link from "next/link";
import Image from "next/image";
import { Settings, ArrowLeft, Shield } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/">
          <Image
            src="/pixentra-logo.svg"
            alt="PIXENTRA"
            width={120}
            height={60}
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-[#1a7fc4] transition-colors mr-2"
          >
            Dashboard
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-10 h-10 ring-2 ring-gray-200/80 hover:ring-[#1a7fc4]/50 transition-all",
              },
            }}
          />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#1a7fc4] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-500">
            Manage your PIXENTRA profile, credentials, and security preferences.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Settings className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {user?.fullName || user?.firstName || "PIXENTRA User"}
              </h2>
              <p className="text-sm text-gray-500">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#1a7fc4]" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Authentication Provider</p>
                  <p className="text-xs text-gray-500">Managed securely via Clerk</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                Active & Secured
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
