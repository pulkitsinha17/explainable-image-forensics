"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Lock,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  UserX,
} from "lucide-react";

export function PrivacySettings() {
  const { user } = useUser();
  const { signOut } = useClerk();

  // Dialog states
  const [deleteHistoryOpen, setDeleteHistoryOpen] = useState(false);
  const [deleteDataOpen, setDeleteDataOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // Form input for account delete confirmation
  const [confirmInput, setConfirmInput] = useState("");

  // Loading and feedback states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handle Delete History
  const handleDeleteHistory = async () => {
    try {
      setActionLoading(true);
      setActionStatus(null);
      const res = await fetch("/api/user/data/history", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete analysis history.");
      const json = await res.json();
      setActionStatus({
        type: "success",
        text: `Analysis history cleared successfully (${json.deletedCount ?? 0} records deleted).`,
      });
      setDeleteHistoryOpen(false);
      setTimeout(() => setActionStatus(null), 5000);
    } catch (err) {
      console.error(err);
      setActionStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete history.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete All Account Data
  const handleDeleteData = async () => {
    try {
      setActionLoading(true);
      setActionStatus(null);
      const res = await fetch("/api/user/data/all", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account data.");
      setActionStatus({
        type: "success",
        text: "All application data and history have been successfully cleared.",
      });
      setDeleteDataOpen(false);
      setTimeout(() => setActionStatus(null), 5000);
    } catch (err) {
      console.error(err);
      setActionStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete account data.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Permanent Account Deletion
  const handleDeleteAccount = async () => {
    if (confirmInput.trim().toUpperCase() !== "DELETE") {
      return;
    }

    try {
      setActionLoading(true);
      setActionStatus(null);

      // 1. Delete application data in MongoDB
      await fetch("/api/user/data/all", { method: "DELETE" });

      // 2. Delete Clerk user account
      if (user) {
        await user.delete();
      }

      // 3. Sign out and redirect
      await signOut({ redirectUrl: "/" });
    } catch (err) {
      console.error("Account deletion error:", err);
      setActionStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete account. Please contact support.",
      });
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {actionStatus && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            actionStatus.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {actionStatus.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{actionStatus.text}</span>
        </div>
      )}

      {/* 1. Data & Privacy Overview (User-Facing, Single Vertical Card) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1a7fc4] flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Data & Privacy
            </h2>
            <p className="text-xs text-gray-500">
              Information regarding your data ownership, privacy, and storage controls.
            </p>
          </div>
        </div>

        {/* Vertically Stacked Explanations */}
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
            <h3 className="font-bold text-gray-900">Your Data</h3>
            <p className="text-gray-500 leading-relaxed">
              Your uploaded images and generated forensic reports belong exclusively to your account. Your investigation data is protected and accessible only through your authenticated sign-in session.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
            <h3 className="font-bold text-gray-900">Privacy</h3>
            <p className="text-gray-500 leading-relaxed">
              Your images are processed solely to compute forensic indicators, detect potential manipulations, and generate your requested reports. Your data is never made public.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
            <h3 className="font-bold text-gray-900">Access & Retention Control</h3>
            <p className="text-gray-500 leading-relaxed">
              Your analysis history remains safely stored in your account so you can review previous investigations at any time. You can manually delete your history or delete your entire account below.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Danger Zone (Destructive Actions in Single Vertical Card) */}
      <div className="bg-white rounded-2xl border border-rose-100 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-rose-100">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Danger Zone
            </h3>
            <p className="text-xs text-rose-700">
              Irreversible data deletion and account management actions.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Action 1: Delete Analysis History */}
          <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-gray-900">Delete Analysis History</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Permanently remove all your saved image analyses and forensic reports.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteHistoryOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Delete History</span>
            </button>
          </div>

          {/* Action 2: Delete Account Data */}
          <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-gray-900">Delete Account Data</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Remove all your stored PIXENTRA investigations, feedback, and settings data.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteDataOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Data</span>
            </button>
          </div>

          {/* Action 3: Permanently Delete Account */}
          <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-gray-900">Delete Account Permanently</p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Permanently delete your PIXENTRA account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setConfirmInput("");
                setDeleteAccountOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Confirm Delete History */}
      {deleteHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Analysis History?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure? This will permanently delete all your saved image forensic analyses. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteHistoryOpen(false)}
                disabled={actionLoading}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteHistory}
                disabled={actionLoading}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{actionLoading ? "Deleting..." : "Delete History"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Account Data */}
      {deleteDataOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete All Account Data?</h3>
              <p className="text-xs text-gray-500 mt-1">
                This will delete all your stored investigations, feedback entries, and usage records. Your account login will remain active.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteDataOpen(false)}
                disabled={actionLoading}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteData}
                disabled={actionLoading}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{actionLoading ? "Deleting..." : "Delete All Data"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Permanently Delete Account */}
      {deleteAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-gray-900">Delete Account Permanently</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteAccountOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <p className="font-semibold text-gray-900">
                Are you absolutely sure you want to delete your account?
              </p>
              <p>
                This will immediately and permanently delete your PIXENTRA profile, all analysis records, and your authentication credentials.
              </p>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-medium">
                To confirm, type <strong className="font-bold font-mono text-rose-900">DELETE</strong> below:
              </div>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteAccountOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={actionLoading || confirmInput.trim().toUpperCase() !== "DELETE"}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{actionLoading ? "Deleting Account..." : "Permanently Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
