"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
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
import {
  EASE_OUT,
  SPRING_PANEL,
  SPRING_PRESS,
  containerVariantsFast,
  fadeUpItem,
} from "@/components/motion-utils";

export function PrivacySettings() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const shouldReduceMotion = useReducedMotion();

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
    <motion.div
      variants={containerVariantsFast}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate="visible"
      className="space-y-6"
    >
      {/* Feedback Banner */}
      <AnimatePresence>
        {actionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 shadow-2xs ${
              actionStatus.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60"
                : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60"
            }`}
          >
            {actionStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{actionStatus.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Data & Privacy Overview */}
      <motion.div
        variants={fadeUpItem}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6"
      >
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1a7fc4] dark:text-[#5bb8f5] flex items-center justify-center shrink-0 shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Data & Privacy
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Information regarding your data ownership, privacy, and storage controls.
            </p>
          </div>
        </div>

        {/* Vertically Stacked Explanations */}
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100/90 dark:border-slate-700/60 space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white">Your Data</h3>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed">
              Your uploaded images and generated forensic reports belong exclusively to your account. Your investigation data is protected and accessible only through your authenticated sign-in session.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100/90 dark:border-slate-700/60 space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white">Privacy</h3>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed">
              Your images are processed solely to compute forensic indicators, detect potential manipulations, and generate your requested reports. Your data is never made public.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100/90 dark:border-slate-700/60 space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white">Access & Retention Control</h3>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed">
              Your analysis history remains safely stored in your account so you can review previous investigations at any time. You can manually delete your history or delete your entire account below.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2. Danger Zone */}
      <motion.div
        variants={fadeUpItem}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-rose-900/40 p-6 sm:p-7 shadow-xs space-y-5 relative overflow-hidden"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-rose-100 dark:border-rose-900/30">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-2xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Danger Zone
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-400">
              Irreversible data deletion and account management actions.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Action 1: Delete Analysis History */}
          <div className="p-4 rounded-xl bg-rose-50/30 dark:bg-rose-950/20 border border-rose-100/80 dark:border-rose-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose-50/50 dark:hover:bg-rose-950/40 transition-colors">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Delete Analysis History</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                Permanently remove all your saved image analyses and forensic reports.
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING_PRESS}
              onClick={() => setDeleteHistoryOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Delete History</span>
            </motion.button>
          </div>

          {/* Action 2: Delete Account Data */}
          <div className="p-4 rounded-xl bg-rose-50/30 dark:bg-rose-950/20 border border-rose-100/80 dark:border-rose-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose-50/50 dark:hover:bg-rose-950/40 transition-colors">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Delete Account Data</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                Remove all your stored PIXENTRA investigations, feedback, and settings data.
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING_PRESS}
              onClick={() => setDeleteDataOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Data</span>
            </motion.button>
          </div>

          {/* Action 3: Permanently Delete Account */}
          <div className="p-4 rounded-xl bg-rose-50/30 dark:bg-rose-950/20 border border-rose-100/80 dark:border-rose-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose-50/50 dark:hover:bg-rose-950/40 transition-colors">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Delete Account Permanently</p>
              <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                Permanently delete your PIXENTRA account and all associated data. This action cannot be undone.
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={SPRING_PRESS}
              onClick={() => {
                setConfirmInput("");
                setDeleteAccountOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal: Confirm Delete History */}
      <AnimatePresence>
        {deleteHistoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteHistoryOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={SPRING_PANEL}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Analysis History?</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Are you sure? This will permanently delete all your saved image forensic analyses. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteHistoryOpen(false)}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING_PRESS}
                  onClick={handleDeleteHistory}
                  disabled={actionLoading}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 shadow-2xs"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{actionLoading ? "Deleting..." : "Delete History"}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirm Delete Account Data */}
      <AnimatePresence>
        {deleteDataOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteDataOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={SPRING_PANEL}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete All Account Data?</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  This will delete all your stored investigations, feedback entries, and usage records. Your account login will remain active.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteDataOpen(false)}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING_PRESS}
                  onClick={handleDeleteData}
                  disabled={actionLoading}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 shadow-2xs"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{actionLoading ? "Deleting..." : "Delete All Data"}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirm Permanently Delete Account */}
      <AnimatePresence>
        {deleteAccountOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteAccountOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={SPRING_PANEL}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Account Permanently</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteAccountOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-gray-600 dark:text-slate-300">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Are you absolutely sure you want to delete your account?
                </p>
                <p>
                  This will immediately and permanently delete your PIXENTRA profile, all analysis records, and your authentication credentials.
                </p>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300 font-medium">
                  To confirm, type <strong className="font-bold font-mono text-rose-900 dark:text-rose-200">DELETE</strong> below:
                </div>
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteAccountOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING_PRESS}
                  onClick={handleDeleteAccount}
                  disabled={actionLoading || confirmInput.trim().toUpperCase() !== "DELETE"}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{actionLoading ? "Deleting Account..." : "Permanently Delete"}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
