import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignInPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-[#0B0B0B] dark:to-[#121212] dark:bg-[#0B0B0B] px-4 py-12 transition-colors duration-200">
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Image
              src="/pixentra-logo.svg"
              alt="PIXENTRA"
              width={160}
              height={80}
              className="h-12 w-auto mx-auto dark:hidden"
            />
            <Image
              src="/pixentra-logo-dark.svg"
              alt="PIXENTRA"
              width={160}
              height={80}
              className="h-12 w-auto mx-auto hidden dark:block"
            />
          </Link>
          <p className="mt-2 text-gray-500 dark:text-slate-400 text-sm">Sign in to your PIXENTRA account</p>
        </div>

        {/* Clerk Sign In component */}
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
