"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";

export function FeedbackCard() {
  const [rating, setRating] = useState<"useful" | "not_useful" | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating && !feedbackText.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7 transition-all animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Rating */}
        <div className="lg:col-span-6 space-y-3">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-gray-900">
              Was this analysis helpful?
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Your feedback helps us improve PIXENTRA&apos;s analysis accuracy.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setRating("useful")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                rating === "useful"
                  ? "border-[#1a7fc4] bg-[#eef6fc] text-[#1a7fc4] shadow-xs"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ThumbsUp
                className={`w-4 h-4 ${
                  rating === "useful" ? "text-[#1a7fc4]" : "text-gray-500"
                }`}
              />
              <span>Useful</span>
            </button>

            <button
              type="button"
              onClick={() => setRating("not_useful")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                rating === "not_useful"
                  ? "border-red-400 bg-red-50 text-red-700 shadow-xs"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ThumbsDown
                className={`w-4 h-4 ${
                  rating === "not_useful" ? "text-red-600" : "text-gray-500"
                }`}
              />
              <span>Not useful</span>
            </button>
          </div>
        </div>

        {/* Right Side: Additional Feedback */}
        <div className="lg:col-span-6">
          {submitted ? (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-xs sm:text-sm font-medium animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thank you! Your feedback has been recorded.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-1.5">
              <label
                htmlFor="additional-feedback"
                className="block text-xs font-semibold text-gray-700"
              >
                Share additional feedback
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="additional-feedback"
                  type="text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you think (optional)..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-gray-50/80 hover:bg-gray-100/60 focus:bg-white border border-gray-200/80 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/20 focus:border-[#1a7fc4] transition-all"
                />
                <button
                  type="submit"
                  disabled={!rating && !feedbackText.trim()}
                  className="px-4 py-2 bg-[#1a7fc4] hover:bg-[#1565a8] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm shrink-0"
                >
                  Submit
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
