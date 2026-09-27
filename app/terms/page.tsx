import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Scale,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — PIXENTRA | Explainable Image Forensics",
  description:
    "Review the Terms of Service governing access to and usage of PIXENTRA's AI-assisted image forensic analysis platform, tools, and generated reports.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "September 21, 2026";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative py-14 bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-white/[0.02] dark:via-[#0B0B0B] dark:to-[#0B0B0B] border-b border-gray-100 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 rounded-full mb-5">
              <Scale className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
              <span className="text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] tracking-wide uppercase">
                Terms & Conditions
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Terms of Service
            </h1>

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
              Last updated: {lastUpdated}
            </p>

            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm leading-relaxed text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              <p>
                Welcome to <span className="font-semibold text-gray-900 dark:text-white">PIXENTRA</span>. These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;) and PIXENTRA (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) governing your access to and use of the PIXENTRA website, software, application programming interfaces, and AI-assisted digital image forensics platform.
              </p>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-12 bg-white dark:bg-[#0B0B0B]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {/* Section 1 */}
              <div id="acceptance-of-terms" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    1
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Acceptance of Terms
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    By registering an account, accessing, browsing, or uploading images to the PIXENTRA platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our{" "}
                    <Link href="/privacy" className="text-[#1a7fc4] dark:text-[#5bb8f5] font-medium hover:underline">
                      Privacy Policy
                    </Link>
                    . If you do not agree to all provisions of these Terms, you must immediately discontinue use of the platform.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div id="description-of-service" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    2
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Description of the Service
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    PIXENTRA is an explainable multi-evidence digital image forensics platform. The service provides algorithmic and neural evaluations to detect potential signs of digital image manipulation, generate spatial localization heatmaps, analyze forensic indicators across multiple evidence streams (such as frequency anomalies, error level compression patterns, noise distributions, and metadata), deliver natural-language forensic explanations, and generate downloadable forensic PDF reports.
                  </p>
                </div>
              </div>

              {/* Section 3 */}
              <div id="eligibility-and-account" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    3
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Eligibility and Account
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    To use authenticated features of PIXENTRA, you must be of legal age to form a binding contract in your jurisdiction (minimum 16 years of age or applicable regional threshold). You agree to provide accurate, current, and complete registration information and to maintain the security and confidentiality of your login credentials. You are solely responsible for all activities that occur under your account.
                  </p>
                </div>
              </div>

              {/* Section 4 */}
              <div id="acceptable-use" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    4
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Acceptable Use Policy
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    You agree to use PIXENTRA solely for lawful, authorized, and legitimate investigative, journalistic, academic, or personal analysis purposes. You strictly agree NOT to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Upload images containing unlawful, defamatory, abusive, sexually explicit, or infringing content.</li>
                    <li>Attempt to probe, scan, or test the vulnerability of PIXENTRA&apos;s infrastructure without explicit written authorization.</li>
                    <li>Reverse-engineer, decompile, disassemble, or extract source code or underlying neural weights of the platform.</li>
                    <li>Circumvent or attempt to bypass subscription tiers, rate limits, quota controls, or authentication mechanisms.</li>
                    <li>Transmit malicious code, viruses, trojans, worms, or destructive payloads to the platform.</li>
                    <li>Use the platform to harass, defame, impersonate, or violate the legal rights of any individual or entity.</li>
                    <li>Upload or process image content that you do not possess legal rights, authorization, or fair-use permission to analyze.</li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div id="user-content" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    5
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    User Content and Upload Permissions
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    You retain all ownership and intellectual property rights in and to the images, files, and materials you upload to PIXENTRA (&ldquo;User Content&rdquo;).
                  </p>
                  <p>
                    By uploading User Content to the platform, you grant PIXENTRA a limited, non-exclusive, worldwide, royalty-free license solely to host, transmit, store, process, and analyze your content as strictly necessary to operate the platform and deliver your analysis results and reports. You represent and warrant that you possess all necessary rights, licenses, and permissions to submit such content to the platform.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div id="image-analysis-and-results" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    6
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Image Analysis and Results
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <div className="p-5 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300">
                    <p className="font-semibold mb-1 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      Analytical & Informational Nature of Forensic Results
                    </p>
                    <p className="text-sm leading-relaxed">
                      PIXENTRA is designed as an AI-assisted forensic analysis tool. Forensic analysis scores, heatmaps, confidence percentages, and textual explanations are analytical indicators provided for informational assistance. They do not constitute certified legal, judicial, or expert witness determinations and must not be treated as infallible proof of authenticity or tampering.
                    </p>
                  </div>
                  <p>
                    Digital media synthesis, compression algorithms, camera artifacts, and manipulation techniques are constantly evolving. PIXENTRA makes no warranty that every manipulation will be detected or that all predictions will be free of false positives or false negatives. Users are advised to independently verify critical conclusions with certified forensic practitioners and complementary investigative methodologies.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div id="reports-and-outputs" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    7
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Reports and Generated Outputs
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    You may export, download, and utilize forensic PDF reports, localization maps, and forensic summaries generated by PIXENTRA for your lawful research, journalistic, organizational, or academic workflows, provided that PIXENTRA&apos;s notices, disclaimers, and contextual caveats remain intact when shared.
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div id="subscriptions-and-payments" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    8
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Subscriptions and Payments
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    PIXENTRA offers free and paid subscription plans detailing analysis quotas, processing limits, and feature availability as described on our{" "}
                    <Link href="/pricing" className="text-[#1a7fc4] dark:text-[#5bb8f5] font-medium hover:underline">
                      Pricing
                    </Link>{" "}
                    page.
                  </p>
                  <p>
                    When paid plans are active, subscriptions are billed in advance on a recurring monthly or yearly cycle. You agree to provide valid payment information and authorize recurring billing until cancellation. Pricing, feature allocations, and subscription terms may be updated from time to time with advance notice.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div id="free-trials-and-usage" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    9
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Free Trials and Free Usage
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    We may offer free tier usage or promotional trial access subject to quota limits. PIXENTRA reserves the right to modify, adjust, or discontinue free allocations, feature availability, or promotional tiers at our sole discretion with or without prior notice.
                  </p>
                </div>
              </div>

              {/* Section 10 */}
              <div id="intellectual-property" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    10
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Intellectual Property
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    The PIXENTRA platform, including all user interfaces, logos, trademarks, visual assets, software code, algorithms, forensic pipelines, and documentation, is the proprietary property of PIXENTRA and is protected by copyright, trademark, and intellectual property laws. Except for the limited rights expressly granted herein, no title, ownership, or intellectual property rights are transferred to you.
                  </p>
                </div>
              </div>

              {/* Section 11 */}
              <div id="third-party-services" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    11
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Third-Party Services
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    The platform may rely upon or incorporate third-party services (such as authentication providers, payment gateways, and cloud infrastructure). Your use of such third-party tools is subject to their respective terms and conditions. PIXENTRA is not responsible for the independent performance, availability, or policies of third-party providers.
                  </p>
                </div>
              </div>

              {/* Section 12 */}
              <div id="privacy-policy-reference" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    12
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Privacy
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    Our data handling practices are described in detail in our{" "}
                    <Link href="/privacy" className="text-[#1a7fc4] dark:text-[#5bb8f5] font-medium hover:underline">
                      Privacy Policy
                    </Link>
                    . By using PIXENTRA, you agree that we may collect, process, store, and share your data in accordance with our Privacy Policy.
                  </p>
                </div>
              </div>

              {/* Section 13 */}
              <div id="service-availability" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    13
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Service Availability
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    While we strive to ensure high availability and responsiveness, PIXENTRA is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do not guarantee uninterrupted, error-free, or zero-latency service. We reserve the right to modify, suspend, or perform maintenance on the platform at any time without liability.
                  </p>
                </div>
              </div>

              {/* Section 14 */}
              <div id="disclaimers" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    14
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Disclaimers of Warranties
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PIXENTRA DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT FORENSIC ANALYSIS RESULTS WILL MEET YOUR SPECIFIC LEGAL OR COMMERCIAL REQUIREMENTS, OR THAT DETECTION WILL IDENTIFY ALL FORGERIES OR DIGITAL MANIPULATIONS.
                  </p>
                </div>
              </div>

              {/* Section 15 */}
              <div id="limitation-of-liability" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    15
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Limitation of Liability
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL PIXENTRA, ITS DIRECTORS, EMPLOYEES, AFFILIATES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, GOODWILL, OR BUSINESS REPUTATION, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE OR RELIANCE UPON ANY FORENSIC ANALYSIS OUTPUTS.
                  </p>
                  <p>
                    IN ALL CASES, PIXENTRA&apos;S TOTAL CUMULATIVE LIABILITY FOR ANY CLAIMS UNDER THESE TERMS SHALL BE LIMITED TO THE GREATER OF THE TOTAL AMOUNTS PAID BY YOU TO PIXENTRA IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM OR ONE HUNDRED US DOLLARS (USD $100).
                  </p>
                </div>
              </div>

              {/* Section 16 */}
              <div id="indemnification" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    16
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Indemnification
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    You agree to defend, indemnify, and hold harmless PIXENTRA, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or legal expenses arising from or in any way related to: (a) your use or misuse of the platform; (b) any content or images you upload; (c) your breach of these Terms; or (d) your infringement of any third party&apos;s intellectual property or privacy rights.
                  </p>
                </div>
              </div>

              {/* Section 17 */}
              <div id="termination" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    17
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Suspension and Termination
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    We reserve the right to suspend or terminate your account and access to PIXENTRA immediately, without prior notice or liability, if you violate these Terms, engage in harmful behavior, or if required by law. You may terminate your account at any time through your profile settings or by contacting our support team.
                  </p>
                </div>
              </div>

              {/* Section 18 */}
              <div id="changes-to-terms" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    18
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Changes to the Service and Terms
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    We may revise and update these Terms from time to time to reflect modifications to our platform, changes in law, or operational improvements. All updates are effective immediately upon posting to this page with an updated &ldquo;Last updated&rdquo; timestamp. Continued use of PIXENTRA after modifications constitute your binding agreement to the updated Terms.
                  </p>
                </div>
              </div>

              {/* Section 19 */}
              <div id="governing-law" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    19
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Governing Law
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p className="italic text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 text-sm">
                    Governing law and jurisdiction will be specified by PIXENTRA before production launch.
                  </p>
                </div>
              </div>

              {/* Section 20 */}
              <div id="contact" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    20
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Contact Information
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    For inquiries, notices, or clarifications regarding these Terms of Service, please contact us:
                  </p>
                  <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">PIXENTRA Legal & Compliance</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Legal Inquiries:{" "}
                      <a
                        href="mailto:legal@pixentra.example"
                        className="text-[#1a7fc4] dark:text-[#5bb8f5] font-medium hover:underline"
                      >
                        legal@pixentra.example
                      </a>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Customer Support:{" "}
                      <a
                        href="mailto:support@pixentra.example"
                        className="text-[#1a7fc4] dark:text-[#5bb8f5] font-medium hover:underline"
                      >
                        support@pixentra.example
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="mt-16 p-8 bg-gradient-to-r from-blue-50/70 via-blue-50/40 to-white dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 rounded-3xl border border-blue-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Have questions about how we handle data?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Read our Privacy Policy to learn more about our security practices, media storage, and user rights.
                </p>
              </div>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a7fc4] text-white text-sm font-semibold hover:bg-[#1565a8] transition-colors shadow-sm whitespace-nowrap"
              >
                View Privacy Policy
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
