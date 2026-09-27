import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Brain, Layers, Search, Shield } from "lucide-react";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "About — PIXENTRA | Explainable Image Forensics",
  description:
    "Learn about PIXENTRA, an explainable multi-evidence image forensics platform designed to detect suspicious image manipulation and present supporting forensic evidence in an understandable form.",
};

const sections = [
  {
    icon: Brain,
    title: "Our Approach",
    body: "PIXENTRA is designed around the principle that forensic results must be explainable, not just accurate. Instead of producing a simple binary verdict, the platform presents the supporting evidence behind each result — allowing users to evaluate the reasoning rather than blindly accept a conclusion.",
  },
  {
    icon: Search,
    title: "Explainable Analysis",
    body: "Every analysis PIXENTRA performs is paired with a human-readable breakdown of the forensic evidence that contributed to the result. Pixel-level heatmaps highlight suspicious regions, and evidence streams are presented individually so the basis for each conclusion is transparent.",
  },
  {
    icon: Layers,
    title: "Multi-Evidence Forensics",
    body: "Rather than relying on a single forensic signal, PIXENTRA aggregates multiple complementary evidence streams — spatial and pixel analysis, frequency-domain examination, noise pattern analysis, compression artifact inspection (ELA), statistical characterization, and metadata review — to provide a more complete and reliable forensic picture.",
  },
  {
    icon: Shield,
    title: "Why PIXENTRA",
    body: "Digital image manipulation has become increasingly accessible, making the ability to identify and understand suspicious modifications more important than ever — for journalists, researchers, investigators, and individuals alike. PIXENTRA aims to make image forensics more accessible, interpretable, and trustworthy through AI-assisted explainable analysis.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0B0B0B]/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Back to PIXENTRA home">
            <Image
              src="/pixentra-logo.svg"
              alt="PIXENTRA"
              width={200}
              height={100}
              className="h-10 sm:h-12 w-auto block dark:hidden"
              priority
            />
            <Image
              src="/pixentra-logo-dark.svg"
              alt="PIXENTRA"
              width={200}
              height={100}
              className="h-10 sm:h-12 w-auto hidden dark:block"
              priority
            />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle variant="compact" />
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-300 hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50/60 via-white to-white dark:from-white/[0.02] dark:via-[#0B0B0B] dark:to-[#0B0B0B] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 dark:bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/60 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1a7fc4] dark:bg-[#5bb8f5] animate-pulse" />
            <span className="text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] tracking-wide uppercase">
              Explainable Image Forensics
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
            PIXENTRA
            <span className="block text-[#1a7fc4] dark:text-[#5bb8f5] text-3xl lg:text-4xl font-semibold mt-2">
              See Beyond the Pixels
            </span>
          </h1>

          <p className="text-lg text-gray-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            PIXENTRA is an explainable multi-evidence image forensics platform designed to detect
            suspicious image manipulation, localize potentially manipulated regions, and present
            supporting forensic evidence in an understandable form.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="py-20 bg-white dark:bg-[#0B0B0B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:gap-10">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="flex gap-6 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 transition-all duration-300"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                    </div>
                  </div>
                  {/* Content */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{section.title}</h2>
                    <p className="text-gray-600 dark:text-slate-300 leading-relaxed">{section.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-blue-50/40 dark:bg-[#121212] border-t border-blue-100/50 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs">
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-gray-700 dark:text-slate-200">Research & Academic Context:</span>{" "}
              PIXENTRA is developed as an academic and research demonstration of explainable
              AI-assisted image forensics. Forensic results provided by the platform are
              AI-assisted indicators, not definitive legal or forensic determinations. All analysis
              scores and results are illustrative of the platform&apos;s approach and should be
              interpreted in the context of supporting evidence, not as ground-truth conclusions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-[#0B0B0B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Explore?</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-8">
            Create an account to start analyzing images with PIXENTRA.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-[#1a7fc4] text-white font-semibold rounded-xl hover:bg-[#1565a8] transition-colors shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 font-semibold rounded-xl border border-gray-200 dark:border-slate-700 hover:border-[#1a7fc4] dark:hover:border-[#5bb8f5] hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] transition-all duration-200"
            >
              Home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-slate-800/80 py-8 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <Image
              src="/pixentra-logo.svg"
              alt="PIXENTRA"
              width={120}
              height={60}
              className="h-8 w-auto block dark:hidden"
            />
            <Image
              src="/pixentra-logo-dark.svg"
              alt="PIXENTRA"
              width={120}
              height={60}
              className="h-8 w-auto hidden dark:block"
            />
          </Link>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            © 2026 PIXENTRA. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-slate-400">
            <Link href="/pricing" className="hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] transition-colors">Pricing</Link>
            <Link href="/sign-in" className="hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] transition-colors">Sign In</Link>
            <Link href="/sign-up" className="hover:text-[#1a7fc4] dark:hover:text-[#5bb8f5] transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
