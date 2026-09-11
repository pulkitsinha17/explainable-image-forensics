import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Image
              src="/pixentra-logo.svg"
              alt="PIXENTRA"
              width={160}
              height={80}
              className="h-12 w-auto mx-auto"
            />
          </Link>
          <p className="mt-2 text-gray-500 text-sm">Sign in to your PIXENTRA account</p>
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
          className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
