import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limiter";

const handler = NextAuth(authOptions);

export async function POST(req: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  const url = new URL(req.url);

  // Apply general IP rate limiting to Credentials callback requests to mitigate DDoS/brute forcing
  if (url.pathname.includes("/callback/credentials") || url.pathname.includes("/signin/credentials")) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const limiterResult = await rateLimit(`rate:auth:ip:${ip}`, 20, 15 * 60 * 1000); // 20 attempts per 15 mins per IP
    if (!limiterResult.success) {
      return NextResponse.json(
        { error: "Too many login attempts from this IP. Please try again in 15 minutes." },
        { status: 429 }
      );
    }
  }

  return handler(req, context);
}

export async function GET(req: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  return handler(req, context);
}

