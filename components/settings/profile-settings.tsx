"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  User,
  Mail,
  Calendar,
  KeyRound,
  Camera,
  Trash2,
  Edit2,
  LogOut,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

export function ProfileSettings() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Name Modal State
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Avatar Upload State
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sign Out Confirmation Modals
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showSignOutAllConfirm, setShowSignOutAllConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!isLoaded || !user) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-xs flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin text-[#1a7fc4]" />
          <span className="text-xs font-semibold">Loading profile information...</span>
        </div>
      </div>
    );
  }

  const displayName = user.fullName || user.firstName || user.username || "PIXENTRA User";
  const primaryEmail = user.primaryEmailAddress?.emailAddress || "No email available";
  const firstLetter = (displayName[0] || "U").toUpperCase();

  const formattedCreated = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Active member";

  // Open Name Edit Modal
  const handleOpenNameEdit = () => {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setNameError(null);
    setIsEditingName(true);
  };

  // Save Name Change via Clerk
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setNameSaving(true);
      setNameError(null);
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setIsEditingName(false);
    } catch (err) {
      console.error("Failed to update name:", err);
      setNameError(err instanceof Error ? err.message : "Failed to update profile name.");
    } finally {
      setNameSaving(false);
    }
  };

  // Handle Avatar Image File Upload via Clerk
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage({ type: "error", text: "Image file size must be less than 5MB." });
      return;
    }

    try {
      setAvatarUploading(true);
      setAvatarMessage(null);
      await user.setProfileImage({ file });
      setAvatarMessage({ type: "success", text: "Profile photo updated successfully." });
      setTimeout(() => setAvatarMessage(null), 4000);
    } catch (err) {
      console.error("Failed to update avatar:", err);
      setAvatarMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload profile photo.",
      });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle Remove Avatar via Clerk
  const handleRemoveAvatar = async () => {
    try {
      setAvatarUploading(true);
      setAvatarMessage(null);
      await user.setProfileImage({ file: null });
      setAvatarMessage({ type: "success", text: "Profile picture removed successfully." });
      setTimeout(() => setAvatarMessage(null), 4000);
    } catch (err) {
      console.error("Failed to remove avatar:", err);
      setAvatarMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to remove profile picture.",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Sign out current session
  const handleSignOutCurrent = async () => {
    try {
      setSigningOut(true);
      await signOut({ redirectUrl: "/" });
    } catch (err) {
      console.error("Sign out error:", err);
      setSigningOut(false);
    }
  };

  // Sign out all sessions
  const handleSignOutAll = async () => {
    try {
      setSigningOut(true);
      await signOut({ redirectUrl: "/" });
    } catch (err) {
      console.error("Sign out all error:", err);
      setSigningOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleAvatarFileChange}
      />

      {/* 1. Main Profile Card (Single Vertical Column) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-6">
        {/* Avatar & Header Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-5">
            {/* Avatar with Change Overlay — Circle Frame */}
            <div className="relative group shrink-0">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={displayName}
                  width={80}
                  height={80}
                  unoptimized
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-2xl ring-2 ring-gray-100 shadow-xs">
                  {firstLetter}
                </div>
              )}

              {/* Camera Hover Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                aria-label="Change profile picture"
                className="absolute inset-0 bg-black/45 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer disabled:cursor-not-allowed"
              >
                {avatarUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-semibold">Change</span>
                  </>
                )}
              </button>
            </div>

            {/* Display Info */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {displayName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Active Account
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {primaryEmail}
              </p>
              <p className="text-[11px] text-gray-400">
                Member since {formattedCreated}
              </p>
            </div>
          </div>

          {/* Action Buttons: Change Avatar, Remove Avatar, Edit Name */}
          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
            >
              {avatarUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1a7fc4]" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-gray-500" />
              )}
              <span>{avatarUploading ? "Uploading..." : "Change Avatar"}</span>
            </button>

            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={avatarUploading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Remove Avatar</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNameEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Name</span>
            </button>
          </div>
        </div>

        {/* Feedback Message for Avatar Upload */}
        {avatarMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              avatarMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {avatarMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{avatarMessage.text}</span>
          </div>
        )}

        {/* Vertical Profile Attribute List */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-500">
              <User className="w-4 h-4 text-[#1a7fc4]" />
              <span>Full Name</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {displayName}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-500">
              <Mail className="w-4 h-4 text-[#1a7fc4]" />
              <span>Primary Email</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 truncate">
              {primaryEmail}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-500">
              <KeyRound className="w-4 h-4 text-[#1a7fc4]" />
              <span>User ID</span>
            </div>
            <span className="text-xs font-mono font-medium text-gray-700 truncate">
              {user.id}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-500">
              <Calendar className="w-4 h-4 text-[#1a7fc4]" />
              <span>Account Created</span>
            </div>
            <span className="text-xs font-semibold text-gray-800">
              {formattedCreated}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Account Actions (Sign Out & Session Controls) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Account Session Actions
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Sign out of your active session on this device or terminate all active sign-ins across all browsers.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Sign Out This Device */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-gray-900">Sign Out of PIXENTRA</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                End your current session on this browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSignOutConfirm(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Sign Out All Sessions */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-gray-900">Sign Out of All Sessions</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Revoke all active logins and require re-authentication on every device.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSignOutAllConfirm(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Sign Out All Sessions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Name Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Profile Name</h3>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {nameError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{nameError}</span>
              </div>
            )}

            <form onSubmit={handleSaveName} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/30 focus:border-[#1a7fc4]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a7fc4]/30 focus:border-[#1a7fc4]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  disabled={nameSaving}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={nameSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a7fc4] hover:bg-[#1565a8] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  {nameSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{nameSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Sign Out?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to sign out of your PIXENTRA account on this device?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={signingOut}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOutCurrent}
                disabled={signingOut}
                className="w-full px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {signingOut ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out All Sessions Modal */}
      {showSignOutAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Sign Out All Sessions?</h3>
              <p className="text-xs text-gray-500 mt-1">
                This will terminate all active sign-ins across all browsers and devices. You will need to sign in again.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutAllConfirm(false)}
                disabled={signingOut}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOutAll}
                disabled={signingOut}
                className="w-full px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {signingOut ? "Revoking..." : "Confirm & Sign Out All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
