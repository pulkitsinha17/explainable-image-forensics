"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Check, AlertCircle } from "lucide-react";

interface PricingCheckoutButtonProps {
  planId: "free" | "monthly" | "yearly";
  planName: string;
  cta: string;
  ctaHref: string;
  ctaPaid: boolean;
  highlighted: boolean;
  isCurrentPlan: boolean;
  userSignedIn: boolean;
  userEmail?: string;
  userName?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PricingCheckoutButton({
  planId,
  planName,
  cta,
  ctaHref,
  ctaPaid,
  highlighted,
  isCurrentPlan,
  userSignedIn,
  userEmail,
  userName,
}: PricingCheckoutButtonProps) {
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<
    "initiating" | "opening" | "verifying" | "success" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If this is user's current active plan
  if (isCurrentPlan) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center gap-2 cursor-default"
        >
          <Check className="w-4 h-4" />
          <span>Current Active Plan</span>
        </button>
        <p className="text-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          You are currently on this plan
        </p>
      </div>
    );
  }

  // Free plan link
  if (!ctaPaid) {
    return (
      <div className="space-y-2">
        <Link
          href={userSignedIn ? "/analyze" : ctaHref}
          data-plan-id={planId}
          className="block w-full py-3.5 rounded-2xl font-semibold text-sm text-center transition-all duration-200 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-slate-200 shadow-xs cursor-pointer active:scale-[0.99]"
        >
          {userSignedIn ? "Start Analysis" : cta}
        </Link>
        <p className="text-center text-[11px] text-gray-400 dark:text-slate-500">
          5 lifetime forensic analyses included
        </p>
      </div>
    );
  }

  // Handle paid plan checkout
  const handleCheckout = async () => {
    setErrorMessage(null);

    // If not signed in, redirect to sign-in with return URL
    if (!userSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent("/pricing")}`);
      return;
    }

    try {
      setLoadingState("initiating");

      // 1. Ensure Razorpay Checkout script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error(
          "Failed to load Razorpay Checkout SDK. Please check your internet connection."
        );
      }

      // 2. Create subscription on the server
      const createRes = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.error || "Failed to initialize subscription checkout.");
      }

      const { subscriptionId, keyId } = createData;

      if (!subscriptionId || !keyId) {
        throw new Error("Invalid response received from subscription server.");
      }

      setLoadingState("opening");

      // 3. Configure and open Razorpay modal
      const options = {
        key: keyId,
        subscription_id: subscriptionId,
        name: "PIXENTRA",
        description: `${planName} Plan — Forensic Image Analysis`,
        prefill: {
          name: userName || "",
          email: userEmail || "",
        },
        theme: {
          color: "#1a7fc4",
        },
        modal: {
          ondismiss: () => {
            setLoadingState(null);
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          setLoadingState("verifying");
          try {
            const verifyRes = await fetch("/api/subscription/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              setErrorMessage(
                verifyData.error || "Payment verification failed. Please contact support."
              );
              setLoadingState(null);
              return;
            }

            setLoadingState("success");
            // Navigate to subscription settings with success flag
            router.push("/settings/subscription?payment=success");
          } catch (err: unknown) {
            console.error("[Pricing Checkout] Verification error:", err);
            setErrorMessage(
              "Network error while verifying payment. Your subscription is recorded and will activate shortly."
            );
            setLoadingState(null);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      razorpayInstance.on("payment.failed", (failResponse: any) => {
        console.error("[Pricing Checkout] Payment failed:", failResponse);
        setErrorMessage(
          failResponse.error?.description ||
            "Payment attempt was declined or cancelled. Please try again."
        );
        setLoadingState(null);
      });

      razorpayInstance.open();
    } catch (err: unknown) {
      console.error("[Pricing Checkout] Checkout initialization failed:", err);
      const message =
        err instanceof Error ? err.message : "Failed to open payment gateway.";
      setErrorMessage(message);
      setLoadingState(null);
    }
  };

  const getButtonText = () => {
    if (loadingState === "initiating") return "Preparing Checkout...";
    if (loadingState === "opening") return "Opening Gateway...";
    if (loadingState === "verifying") return "Verifying Payment...";
    if (loadingState === "success") return "Payment Confirmed!";
    return cta;
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loadingState !== null}
        data-plan-id={planId}
        aria-label={`${cta} via Razorpay`}
        className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
          loadingState !== null
            ? "bg-slate-400 dark:bg-slate-700 text-white cursor-wait"
            : highlighted
            ? "bg-[#1a7fc4] hover:bg-[#1565a8] text-white shadow-md shadow-blue-500/20 hover:shadow-lg"
            : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-slate-200 shadow-xs"
        }`}
      >
        {loadingState !== null && (
          <Loader2 className="w-4 h-4 animate-spin text-white flex-shrink-0" />
        )}
        <span>{getButtonText()}</span>
      </button>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/50 flex items-start gap-2 text-left">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-tight">
            {errorMessage}
          </p>
        </div>
      )}

      <p className="text-center text-[11px] text-gray-400 dark:text-slate-500 flex items-center justify-center gap-1">
        <Lock className="w-2.5 h-2.5 flex-shrink-0" />
        Secure checkout via Razorpay • Cancel anytime
      </p>
    </div>
  );
}
