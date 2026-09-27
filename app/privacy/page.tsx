import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Shield,
  Lock,
  Eye,
  Database,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — PIXENTRA | Explainable Image Forensics",
  description:
    "Learn how PIXENTRA collects, uses, stores, processes, and protects your account information, uploaded images, and forensic analysis outputs.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 21, 2026";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Hero Section */}
        <section className="relative py-14 bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-white/[0.02] dark:via-[#0B0B0B] dark:to-[#0B0B0B] border-b border-gray-100 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 rounded-full mb-5">
              <Shield className="w-3.5 h-3.5 text-[#1a7fc4] dark:text-[#5bb8f5]" />
              <span className="text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] tracking-wide uppercase">
                Legal & Data Protection
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Privacy Policy
            </h1>

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
              Last updated: {lastUpdated}
            </p>

            <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-sm leading-relaxed text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              <p>
                At <span className="font-semibold text-gray-900 dark:text-white">PIXENTRA</span>, we respect your privacy and are committed to protecting your personal information and uploaded media. This Privacy Policy outlines how we collect, use, store, process, and safeguard your data when you interact with our website, cloud platform, and AI-assisted image forensics services.
              </p>
            </div>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-12 bg-white dark:bg-[#0B0B0B]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {/* Section 1 */}
              <div id="information-we-collect" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    1
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Information We Collect
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    We collect only information necessary to deliver, maintain, secure, and enhance PIXENTRA&apos;s digital image forensics capabilities. The categories of data collected include:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Account Information:</strong> When you register an account or sign in, we collect your name, email address, authentication credentials, and user profile information provided through our authentication service (Clerk).
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Uploaded Images for Forensic Analysis:</strong> Images you upload directly to the platform for forensic examination, tampering detection, and localization.
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Forensic Analysis Results & Reports:</strong> Analytical artifacts generated during analysis sessions, including spatial localization heatmaps, confidence scores, multi-stream forensic metrics (noise, frequency, compression artifacts, metadata), explanations, and exported PDF reports.
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Usage & Subscription Data:</strong> Details regarding your service tier, number of analyses conducted, feature usage, and plan quotas.
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Technical & Device Information:</strong> Technical logs such as your Internet Protocol (IP) address, browser type and version, operating system, timestamp of requests, referring URLs, and diagnostic error logs.
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Cookies & Local Storage:</strong> Essential session cookies and browser storage tokens required for secure authentication, session management, and interface preferences.
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Note: PIXENTRA does not collect unnecessary personal data or sensitive biometric identifiers beyond what is strictly required to execute image forensic operations.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div id="how-we-use-information" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    2
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    How We Use Information
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    We process collected data for legitimate operational and technological purposes, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>
                      <strong>Platform Operation:</strong> Powering and executing image-forensics analysis, generating heatmaps, evaluating multi-evidence streams, and delivering explainable summaries.
                    </li>
                    <li>
                      <strong>Account Administration:</strong> Managing user registration, verifying identity, maintaining authenticated sessions, and managing profile preferences.
                    </li>
                    <li>
                      <strong>Report Generation & History:</strong> Allowing users to review past analysis records, compare evidence, and download comprehensive forensic PDF reports.
                    </li>
                    <li>
                      <strong>Reliability & Security:</strong> Detecting, diagnosing, and mitigating system vulnerabilities, preventing abuse, mitigating DDoS attacks, and enforcing fair usage policies.
                    </li>
                    <li>
                      <strong>Billing & Subscription Management:</strong> Managing subscription plans, quota tracking, and transaction processing where paid features are active.
                    </li>
                    <li>
                      <strong>Communication & Support:</strong> Providing customer support, responding to inquiries, and notifying you about critical service updates or policy revisions.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 3 */}
              <div id="image-and-analysis-data" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    3
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Image and Analysis Data
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <div className="p-5 bg-blue-50/40 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 text-gray-700 dark:text-gray-300">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                      Forensic Processing & Data Handling
                    </p>
                    <p className="text-sm">
                      When you submit an image to PIXENTRA, the file is transmitted securely to our computational backend to perform automated forensic analysis (such as error level analysis, noise pattern extraction, frequency analysis, spatial feature examination, and metadata parsing).
                    </p>
                  </div>
                  <p>
                    Uploaded images and corresponding analysis records (including generated heatmaps, confidence values, and forensic notes) are stored in secure cloud storage associated with your user account. This enables you to access your historical analysis reports, review past findings from your Dashboard, and export PDF summaries.
                  </p>
                  <p>
                    You retain ownership and control over your uploaded images. You may remove past analysis records from your history via the Dashboard at any time. We do not make your uploaded images or analysis results publicly accessible without your explicit action.
                  </p>
                </div>
              </div>

              {/* Section 4 */}
              <div id="how-we-share-information" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    4
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    How We Share Information
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    PIXENTRA does not sell, rent, or trade your personal information or uploaded images to third parties for marketing or advertising purposes. We may disclose information only under the following limited circumstances:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Essential Infrastructure Providers:</strong> With trusted cloud hosting, database, object storage (e.g. Supabase, AWS/GCP, or local server infrastructure), and technical compute providers that host and process our application services.
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Authentication Services:</strong> With identity providers (Clerk) to securely manage user authentication and session security.
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Payment Processors:</strong> With secure third-party payment gateways (e.g., Razorpay or Stripe).
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Legal Compliance:</strong> When disclosure is required by law, regulation, subpoena, or enforceable governmental order to protect against fraudulent, abusive, or unlawful activities.
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Corporate Transactions:</strong> In the event of a merger, acquisition, corporate reorganization, or sale of assets, subject to confidentiality commitments.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div id="data-storage-and-security" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    5
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Data Storage and Security
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    We implement standard technical and organizational measures designed to protect your information against unauthorized access, loss, misuse, or alteration:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 my-3">
                    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        <Lock className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                        Encryption in Transit
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        All communication between your browser and our servers is secured via modern TLS / HTTPS encryption.
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        <Database className="w-4 h-4 text-[#1a7fc4] dark:text-[#5bb8f5]" />
                        Access Controls
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Data access is restricted through authenticated tokens and scoped permissions for authorized accounts only.
                      </p>
                    </div>
                  </div>
                  <p>
                    While we strive to employ commercially reasonable measures to protect your information, no method of transmission over the Internet or electronic storage is completely infallible. We encourage users to maintain secure credentials and safeguard their accounts.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div id="data-retention" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    6
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Data Retention
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    We retain personal data and analysis records for as long as your account remains active and as necessary to fulfill the services requested, resolve disputes, maintain audit logs, and comply with applicable statutory or legal obligations.
                  </p>
                  <p>
                    When you delete an analysis record or request account closure, we will take reasonable steps to remove or anonymize associated personal data from active production databases in accordance with our system maintenance cycles.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div id="cookies-and-tracking" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    7
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Cookies and Tracking Technologies
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    PIXENTRA uses essential cookies and browser storage technologies primarily to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Authenticate user sessions and maintain secure logins across page visits.</li>
                    <li>Remember user interface settings, filters, and display preferences.</li>
                    <li>Protect against cross-site request forgery and other security threats.</li>
                    <li>Gather basic operational and performance telemetry to detect technical faults.</li>
                  </ul>
                  <p>
                    You may configure your browser settings to decline or delete cookies; however, certain interactive features and authenticated workspace pages may not function properly without essential cookies enabled.
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div id="third-party-services" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    8
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Third-Party Services
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    Our platform may integrate with or link to third-party services for specific features such as identity management, payment handling, and cloud storage. These third-party services operate independently and have their own distinct privacy policies governing how they handle data. We encourage users to review the privacy policies of any third-party services they interact with.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div id="user-rights-and-choices" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    9
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    User Rights and Choices
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    Depending on your jurisdiction and applicable data protection legislation, you may have specific rights regarding your personal information, such as:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Right to Access:</strong> Request a copy of the personal data we hold about you and review your forensic analysis history.
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Right to Rectification:</strong> Update or correct inaccurate account details directly from your settings page.
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Right to Deletion:</strong> Request the erasure of your account and associated analysis history where applicable.
                    </li>
                    <li>
                      <strong className="text-gray-800 dark:text-gray-200">Right to Withdraw Consent:</strong> Withdraw consent for non-essential processing activities where consent was the legal basis.
                    </li>
                  </ul>
                  <p>
                    To exercise any applicable rights, you may contact our team at{" "}
                    <a
                      href="mailto:privacy@pixentra.example"
                      className="text-[#1a7fc4] dark:text-[#5bb8f5] font-medium hover:underline"
                    >
                      privacy@pixentra.example
                    </a>
                    .
                  </p>
                </div>
              </div>

              {/* Section 10 */}
              <div id="childrens-privacy" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    10
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Children&apos;s Privacy
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    PIXENTRA is designed for professional, research, journalistic, academic, and general adult use. The platform is not directed to children under the age of 16 (or applicable legal age in your jurisdiction). We do not knowingly collect personal data from minors. If you believe that a minor has provided us with personal information without parental consent, please contact us immediately so we can remove the data.
                  </p>
                </div>
              </div>

              {/* Section 11 */}
              <div id="international-transfers" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    11
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    International Data Transfers
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    Because PIXENTRA utilizes global cloud hosting, computing, and distribution services, your information and uploaded images may be transferred to, stored, and processed in jurisdictions other than your home country. By using the platform, you acknowledge and agree that your data may be transferred to facilities located in other regions where data protection regulations may differ from those in your jurisdiction.
                  </p>
                </div>
              </div>

              {/* Section 12 */}
              <div id="changes-to-policy" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    12
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Changes to This Privacy Policy
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    We may periodically update this Privacy Policy to reflect advancements in our technology, modifications to our forensic algorithms, operational changes, or new regulatory obligations. When changes occur, we will update the &ldquo;Last updated&rdquo; date at the top of this page. We encourage you to review this policy periodically to stay informed about how we protect your information.
                  </p>
                </div>
              </div>

              {/* Section 13 */}
              <div id="contact-us" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                    13
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Contact Us
                  </h2>
                </div>
                <div className="text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base pl-11">
                  <p>
                    If you have questions, comments, or requests regarding this Privacy Policy or our data handling practices, please contact our team:
                  </p>
                  <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">PIXENTRA Data & Privacy Team</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Email:{" "}
                      <a
                        href="mailto:privacy@pixentra.example"
                        className="text-[#1a7fc4] dark:text-[#5bb8f5] font-medium hover:underline"
                      >
                        privacy@pixentra.example
                      </a>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      General Support:{" "}
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
                  Looking for our Terms of Service?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Read the conditions governing use of PIXENTRA&apos;s image forensic platform and analytical reports.
                </p>
              </div>
              <Link
                href="/terms"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a7fc4] text-white text-sm font-semibold hover:bg-[#1565a8] transition-colors shadow-sm whitespace-nowrap"
              >
                View Terms of Service
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
