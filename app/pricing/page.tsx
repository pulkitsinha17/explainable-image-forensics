import Link from "next/link";
import Image from "next/image";
import { Check, ArrowLeft, Zap, Star } from "lucide-react";
import type { Metadata } from "next";
import { PLAN_DEFINITIONS } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "Pricing — PIXENTRA | Simple Plans for Image Forensics",
  description:
    "Choose the PIXENTRA plan that fits your needs. From free basic analysis to full multi-evidence forensic investigation with heatmaps and explainable results.",
};

const plans = [
  {
    ...PLAN_DEFINITIONS.free,
    cta: "Get Started",
    ctaHref: "/sign-up",
  },
  {
    ...PLAN_DEFINITIONS.monthly,
    cta: "Choose Monthly",
    ctaHref: "/sign-up",
  },
  {
    ...PLAN_DEFINITIONS.yearly,
    cta: "Choose Yearly",
    ctaHref: "/sign-up",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Back to PIXENTRA home">
            <Image
              src="/pixentra-logo.svg"
              alt="PIXENTRA"
              width={180}
              height={90}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a7fc4] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-[#1a7fc4] hover:bg-blue-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#1a7fc4] rounded-lg hover:bg-[#1565a8] transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50/60 via-white to-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-6">
            <Zap className="w-3 h-3 text-[#1a7fc4]" />
            <span className="text-xs font-semibold text-[#1a7fc4] tracking-wide uppercase">
              Simple, Transparent Pricing
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Simple Plans for Smarter<br className="hidden sm:block" /> Image Forensics
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Choose the level of analysis that fits your needs.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl border flex flex-col transition-all duration-300 ${
                  plan.highlighted
                    ? "border-[#1a7fc4] shadow-xl shadow-blue-100/60 scale-[1.02]"
                    : "border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200"
                } bg-white`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${
                        plan.highlighted
                          ? "bg-[#1a7fc4] text-white"
                          : "bg-amber-400 text-amber-900"
                      }`}
                    >
                      {plan.highlighted && <Star className="w-3 h-3" />}
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8 flex flex-col flex-1">
                  {/* Plan name & tagline */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                    <p className="text-sm text-gray-500">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm text-gray-500 mb-1.5">{plan.period}</span>
                      )}
                    </div>
                    {plan.savings && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        {plan.savings}
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className={`h-px mb-6 ${plan.highlighted ? "bg-blue-100" : "bg-gray-100"}`} />

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.highlighted ? "bg-[#1a7fc4]" : "bg-blue-50 border border-blue-100"
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 ${
                              plan.highlighted ? "text-white" : "text-[#1a7fc4]"
                            }`}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA button — Note: Razorpay payment not yet integrated */}
                  {plan.id === "free" ? (
                    <Link
                      href={plan.ctaHref}
                      data-plan-id={plan.id}
                      className={`block w-full py-3.5 rounded-2xl font-semibold text-sm text-center transition-all duration-200 bg-gray-900 text-white hover:bg-gray-800`}
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      data-plan-id={plan.id}
                      data-plan-price={plan.price}
                      disabled
                      aria-label="Payment coming soon"
                      className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                        plan.highlighted
                          ? "bg-[#1a7fc4] text-white opacity-70 cursor-not-allowed"
                          : "bg-gray-100 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Payments coming soon
                    </button>
                  )}

                  {plan.id !== "free" && (
                    <p className="text-center text-xs text-gray-400 mt-3">
                      Payment integration coming soon
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Note about pricing */}
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
              All prices are listed in Indian Rupees (₹). Paid plans are not yet active —
              payment integration via Razorpay will be added soon. The Free plan is fully
              functional and requires only a free account.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ-style bottom section */}
      <section className="py-16 bg-blue-50/40 border-t border-blue-100/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Common Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "Is the Free plan really free?",
                a: "Yes. The Free plan requires only a free PIXENTRA account. There is no credit card required to get started.",
              },
              {
                q: "What counts as 'basic' vs. 'full' analysis?",
                a: "Basic analysis provides a general result. Full analysis includes pixel-level heatmaps, all 5+ forensic evidence streams, and a detailed human-readable explanation.",
              },
              {
                q: "When will paid plans be available?",
                a: "Razorpay payment integration is planned. Paid plan buttons currently show a 'coming soon' state and do not process payments.",
              },
              {
                q: "Are the analysis results definitive?",
                a: "No. PIXENTRA provides AI-assisted forensic indicators. Results are not legal determinations and should be interpreted as supporting evidence, not final conclusions.",
              },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <p className="text-sm font-semibold text-gray-900 mb-2">{item.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <Image
              src="/pixentra-logo.svg"
              alt="PIXENTRA"
              width={120}
              height={60}
              className="h-8 w-auto"
            />
          </Link>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} PIXENTRA. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/about" className="hover:text-[#1a7fc4] transition-colors">About</Link>
            <Link href="/sign-in" className="hover:text-[#1a7fc4] transition-colors">Sign In</Link>
            <Link href="/sign-up" className="hover:text-[#1a7fc4] transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
