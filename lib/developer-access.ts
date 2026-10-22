import { clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";

/**
 * Checks whether an authenticated Clerk user is authorized as a verified developer
 * entitled to unlimited image analyses.
 *
 * Requirements:
 * 1. PIXENTRA_DEVELOPER_EMAILS server environment variable must be set (comma-separated).
 * 2. Clerk user must exist and have a primary email address.
 * 3. The primary email address must be verified in Clerk (verification.status === "verified").
 * 4. The normalized primary email address must match one of the authorized developer emails.
 *
 * @param clerkUserId Authenticated Clerk user ID
 * @returns true if verified developer, false otherwise
 */
export const isDeveloperUser = cache(
  async (clerkUserId: string | null | undefined): Promise<boolean> => {
    if (!clerkUserId || typeof clerkUserId !== "string") {
      return false;
    }

    const rawDevEmails = process.env.PIXENTRA_DEVELOPER_EMAILS;
    if (!rawDevEmails || !rawDevEmails.trim()) {
      return false;
    }

    const allowedEmails = rawDevEmails
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);

    if (allowedEmails.length === 0) {
      return false;
    }

    try {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      if (!user) {
        console.warn(`[developer-access] User not found for ID: ${clerkUserId}`);
        return false;
      }

      const primaryEmailId = user.primaryEmailAddressId;
      if (!primaryEmailId) {
        console.warn(`[developer-access] User ID ${clerkUserId} has no primaryEmailAddressId set.`);
        return false;
      }

      const primaryEmailObj = user.emailAddresses?.find(
        (email) => email.id === primaryEmailId
      );

      if (!primaryEmailObj || !primaryEmailObj.emailAddress) {
        console.warn(
          `[developer-access] Primary email record not found for user ID: ${clerkUserId} with primaryEmailAddressId: ${primaryEmailId}`
        );
        return false;
      }

      const verificationStatus = primaryEmailObj.verification?.status;
      if (verificationStatus !== "verified") {
        console.warn(
          `[developer-access] Primary email for user ID ${clerkUserId} is not verified (status: ${verificationStatus ?? "unknown"}).`
        );
        return false;
      }

      const normalizedEmail = primaryEmailObj.emailAddress.trim().toLowerCase();
      const isAuthorized = allowedEmails.includes(normalizedEmail);

      if (isAuthorized) {
        console.info(
          `[developer-access] Verified developer access granted for user ID: ${clerkUserId}`
        );
        return true;
      }

      return false;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(
        `[developer-access] Clerk lookup error for user ID ${clerkUserId}: ${errorMsg}`
      );
      return false;
    }
  }
);
