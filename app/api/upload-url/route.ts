import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getR2Client, r2BucketName } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Verify authorized user
    if (!session || (session.user.status !== "APPROVED" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Account pending verification." }, { status: 403 });
    }

    const { filename, contentType, folder } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
    }

    const s3 = getR2Client();
    if (!s3) {
      return NextResponse.json({ error: "R2 Storage Client is not configured on server" }, { status: 500 });
    }

    const fileExtension = filename.split(".").pop();
    const cleanFolderName = folder || "memories";
    const key = `${cleanFolderName}/${session.user.username}-${Date.now()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      ContentType: contentType,
    });

    // Generate pre-signed PUT URL valid for 5 minutes (300 seconds)
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // Construct public access URL
    // R2 public access URL format: https://<custom-domain>/<key> or the R2 dev URL
    const publicUrlBase = process.env.R2_PUBLIC_URL || `${process.env.R2_ENDPOINT}/${r2BucketName}`;
    const publicUrl = `${publicUrlBase}/${key}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    });

  } catch (err) {
    console.error("Presigned URL generation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
