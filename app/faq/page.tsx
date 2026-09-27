import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { HelpCircle, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — PIXENTRA | Frequently Asked Questions",
  description:
    "Find answers to common questions about PIXENTRA's AI-assisted image forensics platform, analysis methods, supported formats, reports, and privacy.",
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200">
      {/* Shared Public Navbar */}
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Header / Hero */}
        <section className="relative py-14 bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-white/[0.02] dark:via-[#0B0B0B] dark:to-[#0B0B0B] border-b border-gray-100 dark:border-slate-800/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/60 rounded-full mb-5">
              <HelpCircle className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
              <span className="text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] tracking-wide uppercase">
                FAQ
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Frequently Asked Questions
            </h1>

            <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions about PIXENTRA&apos;s image-forensics platform, analysis, privacy, and reports.
            </p>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="py-14 bg-white dark:bg-[#0B0B0B]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FaqAccordion />

            {/* Support / Quick Links Card */}
            <div className="mt-16 p-8 bg-gradient-to-r from-blue-50/70 via-blue-50/40 to-white dark:from-slate-900/90 dark:via-slate-900/60 dark:to-blue-950/20 rounded-3xl border border-blue-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Have more questions?
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Ready to test an image or explore our pricing plans and forensic capabilities?
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/pricing"
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 text-sm font-semibold hover:border-[#1a7fc4] dark:hover:border-[#5bb8f5] hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] transition-colors whitespace-nowrap shadow-xs"
                >
                  View Pricing
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a7fc4] text-white text-sm font-semibold hover:bg-[#1565a8] transition-colors shadow-xs whitespace-nowrap"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Shared Public Footer */}
      <Footer />
    </div>
  );
}
