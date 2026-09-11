import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/pixentra-logo.svg"
              alt="PIXENTRA"
              width={160}
              height={80}
              className="h-12 w-auto mx-auto"
            />
          </Link>
          <p className="mt-4 text-gray-500 text-sm">Sign in to your PIXENTRA account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h1>

          {/* Clerk sign-in will be mounted here */}
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-gray-600">
              <p className="font-semibold text-gray-800 mb-1">Authentication</p>
              <p>Clerk authentication will be integrated here. Configure your Clerk publishable key to enable sign-in.</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-medium">or</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full px-4 py-3 bg-[#1a7fc4] text-white font-semibold rounded-xl hover:bg-[#1565a8] transition-colors"
            >
              Continue with Email
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#1a7fc4] hover:text-[#1565a8] font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
