"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { AnalysisResults } from "@/components/analyze/analysis-results";
import type { ForensicAnalysisResult } from "@/components/analyze/types";

export function AnalysisDetailViewer({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ForensicAnalysisResult | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAnalysis() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/analyze/${analysisId}`);
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`;
            return;
          }
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to load analysis results.");
        }

        const data = await res.json();
        if (!data.result) {
          throw new Error("Analysis results not found.");
        }

        if (!active) return;
        setResults(data.result);
      } catch (err) {
        if (!active) return;
        console.error("Failed to load analysis:", err);
        setError(err instanceof Error ? err.message : "Failed to load analysis.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAnalysis();

    return () => {
      active = false;
    };
  }, [analysisId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-gray-700">Loading analysis results...</p>
        <p className="text-xs text-gray-400">Retrieving multi-evidence forensic data</p>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-gray-900">Unable to load analysis</h3>
        <p className="text-xs text-gray-500">{error || "The requested analysis could not be found."}</p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Analyze Workspace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <Link
          href="/analyze"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Analyze</span>
        </Link>
      </div>

      <AnalysisResults
        results={results}
        onViewReport={() => router.push(`/report/${analysisId}`)}
        onAnalyzeAnother={() => router.push("/analyze")}
      />
    </div>
  );
}
