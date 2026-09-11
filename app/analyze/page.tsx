import Link from "next/link";
import Image from "next/image";
import { Upload, ArrowLeft, ShieldCheck } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default async function AnalyzePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

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
                  "w-8 h-8 ring-2 ring-[#1a7fc4]/20 hover:ring-[#1a7fc4] transition-all",
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analyze Image</h1>
          <p className="text-gray-500">
            Upload an image to perform deep multi-evidence forgery localization.
          </p>
        </div>

        {/* Upload box */}
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center hover:border-[#1a7fc4] transition-colors group">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1a7fc4] flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Drag & drop your image here
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Supports PNG, JPG, WEBP, TIFF up to 25MB
          </p>
          <button
            type="button"
            className="px-6 py-3 bg-[#1a7fc4] text-white font-semibold rounded-xl hover:bg-[#1565a8] transition-colors shadow-sm"
          >
            Select Image from Device
          </button>
        </div>

        <div className="mt-8 flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-gray-600">
          <ShieldCheck className="w-5 h-5 text-[#1a7fc4] shrink-0" />
          <span>
            Protected Session: Analysis data is private to your account and encrypted in transit.
          </span>
        </div>
      </div>
    </div>
  );
}
