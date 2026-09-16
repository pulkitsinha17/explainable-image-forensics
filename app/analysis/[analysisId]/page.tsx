import { redirect } from "next/navigation";

/**
 * /analysis/[analysisId]
 *
 * Placeholder page — redirects to the main Analyze page.
 * This route is reserved for a future per-analysis detail view.
 */
export default function AnalysisDetailPage() {
  redirect("/analyze");
}
