"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "What is PIXENTRA?",
    answer:
      "PIXENTRA is an AI-assisted digital image forensics platform designed to detect signs of digital manipulation, tampering, and forgery. Unlike traditional tools that provide only a simple binary prediction, PIXENTRA provides an explainable multi-evidence analysis — combining visual localization heatmaps, statistical metrics, and human-readable forensic breakdowns so you understand the reasoning behind each result.",
  },
  {
    id: "faq-2",
    question: "How does PIXENTRA analyze an image?",
    answer:
      "PIXENTRA evaluates images across multiple complementary forensic evidence streams. This includes spatial pixel analysis, frequency domain examination, noise distribution consistency, error level analysis (ELA) to detect compression inconsistencies, statistical artifact detection, and image metadata review. These diverse signals are synthesized to produce a comprehensive forensic assessment.",
  },
  {
    id: "faq-3",
    question: "What image formats does PIXENTRA support?",
    answer:
      "PIXENTRA supports standard digital image formats including JPG (JPEG), PNG, and WebP. The platform currently allows file uploads of up to 10 MB per image, which covers high-resolution photographs, scanned documents, and social media media.",
  },
  {
    id: "faq-4",
    question: "What happens after I upload an image?",
    answer:
      "PIXENTRA processes the uploaded image through multiple forensic analysis methods to examine its visual characteristics and identify potential signs of manipulation. The results include supporting evidence and localized visual information to help you understand the analysis.",
  },
  {
    id: "faq-5",
    question: "What are localization heatmaps?",
    answer:
      "Localization heatmaps are visual spatial overlays mapped directly over your analyzed image. They highlight specific pixel clusters and regions where forensic anomalies or tampering signals are concentrated — such as spliced objects, cloned elements, inpainted areas, or localized compression discrepancies.",
  },
  {
    id: "faq-6",
    question: "Are PIXENTRA's analysis results definitive?",
    answer:
      "No. PIXENTRA provides AI-assisted forensic indicators and analytical assistance. While our models are designed to capture subtle forgery patterns, results are not certified legal determinations or infallible proof of manipulation. Forensic outputs are intended to guide investigative workflows and should be verified with independent evidence where consequential decisions are required.",
  },
  {
    id: "faq-7",
    question: "Can I download or share my forensic report?",
    answer:
      "Yes. Once an analysis is complete, you can generate and download a comprehensive, publication-ready forensic PDF report. The report documents the overall anomaly verdict, pixel localization overlays, detailed scores for all forensic evidence streams, metadata findings, and executive natural-language explanations.",
  },
  {
    id: "faq-8",
    question: "Are my uploaded images private?",
    answer:
      "Yes. Images you upload to PIXENTRA are processed securely to generate your requested forensic evaluations and are stored in association with your private user account so you can review your history and download reports from your Dashboard. We do not sell your personal data or uploaded media, and you can delete analysis records from your history at any time in accordance with our Privacy Policy.",
  },
  {
    id: "faq-9",
    question: "How many analyses can I perform?",
    answer:
      "The number of analyses you can perform depends on your subscription plan. The Free plan includes basic monthly analyses to get started, while our Monthly and Yearly plans provide higher analysis quotas and priority processing. You can view your current quota and plan options on the Pricing page.",
  },
  {
    id: "faq-10",
    question: "Do I need technical or forensic knowledge to use PIXENTRA?",
    answer:
      "Not at all. PIXENTRA is designed to bridge the gap between deep forensic science and everyday usability. While forensic experts and investigators benefit from the detailed technical evidence layers, the platform presents clear visual heatmaps, intuitive risk badges, and plain-language summaries so that journalists, researchers, and general users can easily interpret results.",
  },
];

export function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {FAQ_ITEMS.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
              isOpen
                ? "border-[#1a7fc4] dark:border-[#5bb8f5] shadow-md shadow-blue-50/60 dark:shadow-none"
                : "border-gray-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700/80 hover:shadow-xs"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer select-none"
              aria-expanded={isOpen}
              aria-controls={`answer-${item.id}`}
            >
              <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-snug">
                {item.question}
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                  isOpen
                    ? "bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5]"
                    : "bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-400"
                }`}
              >
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ease-in-out ${
                    isOpen ? "rotate-180 text-[#1a7fc4] dark:text-[#5bb8f5]" : "text-gray-500 dark:text-slate-400"
                  }`}
                />
              </div>
            </button>

            <div
              id={`answer-${item.id}`}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed border-t border-gray-100/80 dark:border-slate-800 mt-1">
                <div className="pt-4">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
