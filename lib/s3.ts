import { S3Client } from "@aws-sdk/client-s3";

let s3Client: S3Client | null = null;

export function getR2Client() {
  if (s3Client) return s3Client;

  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    console.warn("Cloudflare R2 environment variables are missing. File uploads will fail.");
    return null;
  }

  s3Client = new S3Client({
    region: "auto",
    endpoint: endpoint,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });

  return s3Client;
}

export const r2BucketName = process.env.R2_BUCKET_NAME || "yearbook-media";
