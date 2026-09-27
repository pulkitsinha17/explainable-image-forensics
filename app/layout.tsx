import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { GlobalPageTransition } from "@/components/global-page-transition";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PIXENTRA — See Beyond the Pixels | Explainable Image Forensics",
  description:
    "PIXENTRA is an AI-powered digital image forensics platform that analyzes images for signs of manipulation, localizes suspicious regions, and provides understandable forensic evidence explaining why an image may be manipulated.",
  keywords: [
    "image forensics",
    "forgery detection",
    "explainable AI",
    "image manipulation",
    "digital forensics",
    "heatmap",
    "multi-evidence",
  ],
  openGraph: {
    title: "PIXENTRA — See Beyond the Pixels",
    description:
      "AI-powered explainable multi-evidence image forgery detection and localization.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1a7fc4",
          fontFamily: "var(--font-geist-sans)",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "shadow-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl text-slate-900 dark:text-white",
          headerTitle: "text-slate-900 dark:text-white font-bold tracking-tight",
          headerSubtitle: "text-slate-500 dark:text-slate-400 text-xs sm:text-sm",
          socialButtonsBlockButton: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors shadow-2xs rounded-xl",
          socialButtonsBlockButtonText: "text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm",
          dividerLine: "bg-slate-200 dark:bg-slate-700",
          dividerText: "text-slate-400 dark:text-slate-500 text-xs font-medium uppercase",
          formFieldLabel: "text-slate-700 dark:text-slate-300 font-semibold text-xs",
          formFieldInput: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1a7fc4] dark:focus:border-[#5bb8f5] focus:ring-2 focus:ring-[#1a7fc4]/20 rounded-xl text-sm transition-all",
          formButtonPrimary: "bg-[#1a7fc4] hover:bg-[#1565a8] text-white font-semibold transition-all shadow-xs rounded-xl text-sm active:scale-[0.99]",
          footer: "bg-transparent dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-b-2xl",
          footerAction: "bg-transparent dark:bg-slate-900 text-slate-500 dark:text-slate-400",
          footerActionLink: "text-[#1a7fc4] dark:text-[#5bb8f5] hover:text-[#1565a8] font-semibold text-xs transition-colors",
          footerActionText: "text-slate-500 dark:text-slate-400 text-xs",
          footerPages: "bg-transparent dark:bg-slate-900",
          footerPagesLink: "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
          identityPreviewText: "text-slate-900 dark:text-white font-medium text-xs",
          identityPreviewEditButtonIcon: "text-[#1a7fc4] dark:text-[#5bb8f5]",
          formFieldSuccessText: "text-emerald-600 dark:text-emerald-400 text-xs",
          formFieldErrorText: "text-rose-600 dark:text-rose-400 text-xs",
          badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
          userButtonPopoverCard: "shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl text-slate-900 dark:text-white",
          userButtonPopoverMain: "bg-white dark:bg-slate-900",
          userPreviewMainIdentifier: "text-slate-900 dark:text-white font-bold text-sm",
          userPreviewSecondaryIdentifier: "text-slate-500 dark:text-slate-400 text-xs",
          userButtonPopoverActionButton: "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl font-medium text-xs",
          userButtonPopoverActionButtonText: "text-slate-700 dark:text-slate-300 font-medium",
          userButtonPopoverActionButtonIcon: "text-slate-500 dark:text-slate-400",
          userButtonPopoverFooter: "border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 rounded-b-2xl",
          userButtonPopoverFooterPages: "bg-transparent dark:bg-slate-900",
          userProfileCard: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl",
        },
      }}
    >
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var saved = localStorage.getItem('pixentra-theme');
                    if (saved === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body className="min-h-full flex flex-col bg-white text-gray-900 dark:bg-[#0B0B0B] dark:text-gray-100 overflow-x-hidden transition-colors duration-200">
          <ThemeProvider>
            <Suspense fallback={null}>
              <GlobalPageTransition />
            </Suspense>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}



