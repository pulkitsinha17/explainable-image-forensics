"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Shield,
  Lock,
  Mail,
  CheckCircle2,
  KeyRound,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Globe,
  Smartphone,
} from "lucide-react";

export function SecuritySettings() {
  const { user, isLoaded } = useUser();

  // Password Change Modal State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Add Email Modal State
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  if (!isLoaded || !user) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-[#1a7fc4]" />
          <span className="text-xs font-semibold">Loading security settings...</span>
        </div>
      </div>
    );
  }

  const primaryEmail = user.primaryEmailAddress?.emailAddress || "Not available";
  const emailVerified = user.primaryEmailAddress?.verification?.status === "verified";
  const hasPassword = user.passwordEnabled;

  const formattedLastSignIn = user.lastSignInAt
    ? new Date(user.lastSignInAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Current active session";

  // Handle Password Change via Clerk
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordError(null);
      await user.updatePassword({
        currentPassword: hasPassword ? currentPassword : "",
        newPassword,
      });
      setPasswordSuccess("Password updated successfully.");
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess(null);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 2000);
    } catch (err) {
      console.error("Password update error:", err);
      setPasswordError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle Add Email via Clerk
  const handleAddEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setEmailSaving(true);
      setEmailError(null);
      const emailObj = await user.createEmailAddress({ email: newEmail.trim() });
      await emailObj.prepareVerification({ strategy: "email_code" });
      setEmailSuccess("Verification email sent! Please check your inbox.");
      setTimeout(() => {
        setIsAddingEmail(false);
        setEmailSuccess(null);
        setNewEmail("");
      }, 3000);
    } catch (err) {
      console.error("Add email error:", err);
      setEmailError(err instanceof Error ? err.message : "Failed to add email address.");
    } finally {
      setEmailSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Account Security Status (Single Vertical Card) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Account Security Status
            </h2>
            <p className="text-xs text-gray-500">
              Overview of your authentication credentials, session security, and account verification.
            </p>
          </div>
        </div>

        {/* Vertically Stacked Security Overview Items */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-gray-900">Email Verification</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{primaryEmail}</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shrink-0 self-start sm:self-auto">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {emailVerified ? "Verified" : "Unverified"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-gray-900">Last Authenticated Session</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Most recent sign-in activity</p>
            </div>
            <span className="text-xs font-semibold text-gray-800">
              {formattedLastSignIn}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-gray-900">Two-Factor Authentication (2FA)</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Multi-factor sign-in security protection</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 shrink-0 self-start sm:self-auto">
              <Smartphone className="w-3 h-3 text-gray-500" />
              {user.twoFactorEnabled ? "Active" : "Standard"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Password & Authentication (Single Vertical Card) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Password & Authentication
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {hasPassword
                ? "Your account is protected with a password."
                : "Your account is authenticated via external SSO provider (Google)."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsChangingPassword(true);
              setPasswordError(null);
              setPasswordSuccess(null);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{hasPassword ? "Change Password" : "Set Account Password"}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#1a7fc4]" />
            <span className="font-semibold text-gray-800">
              {hasPassword ? "Password Protection Enabled" : "Single Sign-On (SSO) Active"}
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">••••••••••••</span>
        </div>
      </div>

      {/* 3. Email Addresses (Single Vertical Card) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Email Addresses</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Email addresses associated with your account for sign-in and security notifications.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAddingEmail(true);
              setEmailError(null);
              setEmailSuccess(null);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Email</span>
          </button>
        </div>

        <div className="space-y-2">
          {user.emailAddresses.map((emailObj) => {
            const isPrimary = emailObj.id === user.primaryEmailAddressId;
            const isVer = emailObj.verification?.status === "verified";

            return (
              <div
                key={emailObj.id}
                className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="w-4 h-4 text-[#1a7fc4] shrink-0" />
                  <span className="font-semibold text-gray-900 truncate">
                    {emailObj.emailAddress}
                  </span>
                  {isPrimary && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1a7fc4] font-bold text-[10px] uppercase tracking-wider shrink-0">
                      Primary
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      isVer
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {isVer ? "Verified" : "Pending Verification"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Connected Accounts (Single Vertical Card) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Connected Accounts</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            External identity providers linked to your account for single sign-on access.
          </p>
        </div>

        {user.externalAccounts && user.externalAccounts.length > 0 ? (
          <div className="space-y-2">
            {user.externalAccounts.map((acc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#1a7fc4]" />
                  <div>
                    <p className="font-bold text-gray-900 capitalize">
                      {acc.provider} SSO
                    </p>
                    {acc.emailAddress && (
                      <p className="text-[11px] text-gray-500">{acc.emailAddress}</p>
                    )}
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Connected
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-500">
            No external OAuth accounts linked. Sign-in is handled via primary email credentials.
          </div>
        )}
      </div>

      {/* Change / Set Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {hasPassword ? "Change Password" : "Set New Password"}
              </h3>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              {hasPassword && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/30 focus:border-[#1a7fc4]"
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/30 focus:border-[#1a7fc4]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/30 focus:border-[#1a7fc4]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  disabled={passwordSaving}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  {passwordSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{passwordSaving ? "Updating..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Email Modal */}
      {isAddingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add Email Address</h3>
              <button
                type="button"
                onClick={() => setIsAddingEmail(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {emailError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{emailError}</span>
              </div>
            )}

            {emailSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{emailSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddEmailSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/30 focus:border-[#1a7fc4]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingEmail(false)}
                  disabled={emailSaving}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  {emailSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{emailSaving ? "Sending..." : "Add & Verify"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
