import { CheckCircle2, CloudUpload, Clock, ArrowRight } from "lucide-react";

interface UploadSuccessCardProps {
  s3Key: string;
  filename: string;
}

/**
 * Shown after S3 upload succeeds and before forensic analysis begins.
 *
 * IMPORTANT: This card intentionally signals that the image has been
 * securely stored, but forensic analysis has NOT started yet.
 * Real forensic results will be shown in Phase 3 (FastAPI/MPC integration).
 */
export function UploadSuccessCard({ s3Key, filename }: UploadSuccessCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-200/70 shadow-sm p-6 sm:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            Image uploaded successfully
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate" title={filename}>
            {filename}
          </p>
        </div>
      </div>

      {/* Body — Clearly distinguishes upload from analysis */}
      <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
        {/* Upload complete badge */}
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
          <CloudUpload className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-800">
              Secure upload complete
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-mono truncate">
              Stored at: {s3Key}
            </p>
          </div>
        </div>

        {/* Analysis pending badge — clearly not yet done */}
        <div className="flex items-center gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-600">
              Forensic analysis — coming in Phase 3
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              The AI model and MPC pipeline will be wired up in the next phase.
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div className="flex items-start gap-2.5 text-xs text-gray-500 pt-1">
          <ArrowRight className="w-3.5 h-3.5 text-[#1a7fc4] shrink-0 mt-0.5" />
          <p>
            Your image is now securely stored in the private PIXENTRA vault.
            Forensic analysis (localization map, evidence scores, AI explanation)
            will begin automatically once the analysis pipeline is connected.
          </p>
        </div>
      </div>
    </div>
  );
}
