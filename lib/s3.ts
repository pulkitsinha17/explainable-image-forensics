import { S3Client } from "@aws-sdk/client-s3";

/**
 * Server-side S3 client — NEVER import this in client components.
 * Credentials come exclusively from server-side environment variables.
 */

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
  // Surface a clear error at startup rather than a confusing runtime failure
  console.error(
    "[PIXENTRA] Missing AWS credentials. " +
      "Set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in .env.local."
  );
}

export const s3Client = new S3Client({
  region: region ?? "ap-south-1",
  credentials: {
    accessKeyId: accessKeyId ?? "",
    secretAccessKey: secretAccessKey ?? "",
  },
});

/** The private S3 bucket name from environment, with a safe fallback. */
export const S3_BUCKET_NAME =
  process.env.AWS_S3_BUCKET_NAME ?? "pixentra-image-storage-2026";

/** Allowed MIME types for upload validation (server-side). */
export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/tiff": "tiff",
};

/** Maximum upload size in bytes: 10 MB. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
