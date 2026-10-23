import { Check, Zap, Star } from "lucide-react";
import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PLAN_DEFINITIONS, getUserUsageAndLimit } from "@/lib/subscription";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PricingCheckoutButton } from "@/components/pricing/pricing-checkout-button";

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
    ctaPaid: false,
  },
  {
    ...PLAN_DEFINITIONS.monthly,
    cta: "Subscribe Monthly",
    ctaHref: "#",
    ctaPaid: true,
  },
  {
    ...PLAN_DEFINITIONS.yearly,
    cta: "Subscribe Yearly",
    ctaHref: "#",
    ctaPaid: true,
  },
];

const faqs = [
  {
    q: "Is the Free plan really free, and what's included?",
    a: "Yes. The Free plan includes five forensic analyses with no payment required. All plans provide full multi-evidence forensics, localization heatmaps, explainable AI, downloadable PDF reports, and history, differing only in analysis allowances.",
  },
  {
    q: "What happens when I reach my analysis limit?",
    a: "Free plan users can continue analyzing images by upgrading to an eligible paid plan. Monthly and Yearly subscribers receive their respective analysis allowances for each billing period, subject to an active subscription and successful renewal. Your existing analysis history remains available according to the application's history rules.",
  },
  {
    q: "How do monthly and yearly subscriptions work?",
    a: "The Monthly plan is \u20b9199 for up to 25 analyses per billing month. The Yearly plan is \u20b91,999 for up to 300 analyses per subscription year. Secure checkout and subscription management will become available after payment integration is completed.",
  },
  {
    q: "Are PIXENTRA's forensic results definitive?",
    a: "No. PIXENTRA provides AI-assisted forensic indicators and supporting evidence. Results are not legal determinations and should not be treated as definitive proof on their own.",
  },
];

export default async function PricingPage() {
  const { userId } = await auth();
  const usage = userId ? await getUserUsageAndLimit(userId) : null;
  const clerkUser = userId ? await currentUser() : null;

  const userEmail =
    clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress;

  const userName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.username ||
    "";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200">
      {/* Shared Public Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-28 pb-20 bg-gradient-to-br from-blue-50/60 via-white to-white dark:from-white/[0.02] dark:via-[#0B0B0B] dark:to-[#0B0B0B] overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 dark:bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/60 rounded-full mb-6">
              <Zap className="w-3 h-3 text-[#1a7fc4] dark:text-[#5bb8f5]" />
              <span className="text-xs font-semibold text-[#1a7fc4] dark:text-[#5bb8f5] tracking-wide uppercase">
                Simple, Transparent Pricing
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
              Simple Plans for Smarter<br className="hidden sm:block" /> Image Forensics
            </h1>
            <p className="text-lg text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
              Choose the level of analysis that fits your needs.
            </p>
          </div>
        </section>

        {/* Pricing cards — equal height via items-stretch + flex-col inside each card */}
        <section className="py-16 bg-white dark:bg-[#0B0B0B]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {plans.map((plan) => {
                const isCurrentPlan =
                  usage !== null &&
                  usage.plan === plan.id &&
                  (usage.status === "active" || usage.status === "authenticated");

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl border flex flex-col transition-all duration-300 ${
                      plan.highlighted
                        ? "border-[#1a7fc4] dark:border-[#5bb8f5] shadow-xl shadow-blue-100/60 dark:shadow-none scale-[1.02]"
                        : "border-gray-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800"
                    } bg-white dark:bg-slate-900`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${
                            plan.highlighted
                              ? "bg-[#1a7fc4] dark:bg-[#1a7fc4] text-white"
                              : "bg-amber-400 text-amber-900 dark:bg-amber-500 dark:text-amber-950"
                          }`}
                        >
                          {plan.highlighted && <Star className="w-3 h-3" />}
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    {/* Card body — flex-col + flex-1 so all cards fill the row height */}
                    <div className="p-8 flex flex-col flex-1">
                      {/* Plan name & tagline */}
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{plan.tagline}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-8">
                        <div className="flex items-end gap-1">
                          <span className="text-4xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                          {plan.period && (
                            <span className="text-sm text-gray-500 dark:text-slate-400 mb-1.5">{plan.period}</span>
                          )}
                        </div>
                        {plan.savings && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            {plan.savings}
                          </p>
                        )}
                      </div>

                      {/* Divider */}
                      <div
                        className={`h-px mb-6 ${
                          plan.highlighted ? "bg-blue-100 dark:bg-blue-900/50" : "bg-gray-100 dark:bg-slate-800"
                        }`}
                      />

                      {/* Features — flex-1 makes this grow so CTA always sits at bottom */}
                      <ul className="space-y-3 flex-1 mb-8">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                plan.highlighted
                                  ? "bg-[#1a7fc4]"
                                  : "bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40"
                              }`}
                            >
                              <Check
                                className={`w-3 h-3 ${
                                  plan.highlighted ? "text-white" : "text-[#1a7fc4] dark:text-[#5bb8f5]"
                                }`}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-slate-300 leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA area — pinned to bottom via mt-auto */}
                      <div className="mt-auto">
                        <PricingCheckoutButton
                          planId={plan.id}
                          planName={plan.name}
                          cta={plan.cta}
                          ctaHref={plan.ctaHref}
                          ctaPaid={plan.ctaPaid}
                          highlighted={plan.highlighted}
                          isCurrentPlan={isCurrentPlan}
                          userSignedIn={Boolean(userId)}
                          userEmail={userEmail}
                          userName={userName}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footnote */}
            <div className="mt-12 text-center">
              <p className="text-xs text-gray-400 dark:text-slate-500 max-w-lg mx-auto leading-relaxed">
                All prices are listed in Indian Rupees. The Free plan is fully functional and requires only a free
                account.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section className="py-16 bg-blue-50/40 dark:bg-[#121212] border-t border-blue-100/50 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">Common Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((item) => (
                <div
                  key={item.q}
                  className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{item.q}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
