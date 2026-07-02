import { getCsrfToken } from "next-auth/react";

export async function verifyCsrf(req: Request): Promise<boolean> {
  // Only protect state-changing methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return true;
  }

  // 1. Validate Origin / Referer (Standard Request Headers)
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host") || "";

  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const appUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;

  if (origin) {
    if (origin !== appUrl) {
      console.error(`[CSRF] Origin mismatch: expected ${appUrl}, got ${origin}`);
      return false;
    }
  } else if (referer) {
    if (!referer.startsWith(appUrl)) {
      console.error(`[CSRF] Referer mismatch: expected ${appUrl}, got ${referer}`);
      return false;
    }
  } else {
    // Both origin and referer are missing
    console.error(`[CSRF] Missing both Origin and Referer headers`);
    return false;
  }

  // 2. NextAuth CSRF token validation if x-csrf-token is provided
  const clientCsrfToken = req.headers.get("x-csrf-token");
  if (clientCsrfToken) {
    const serverCsrfToken = await getCsrfToken({
      req: {
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      },
    });

    if (clientCsrfToken !== serverCsrfToken) {
      console.error(`[CSRF] Token mismatch: client=${clientCsrfToken}, server=${serverCsrfToken}`);
      return false;
    }
  }

  return true;
}
