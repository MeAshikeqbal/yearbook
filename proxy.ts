import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const isAuth = !!token;

    // 1. Redirect authenticated users away from Auth Pages (/login, /register)
    if ((path === "/login" || path === "/register") && isAuth) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Require Authentication for Protected Routes
    if (!isAuth) {
      if (path.startsWith("/admin") || path.includes("/edit")) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // 3. Role-Based Access Control (RBAC) for Admin Center
    if (path.startsWith("/admin")) {
      if (token.role !== "ADMIN" && token.role !== "MODERATOR") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // 4. Edit Profile Security (Must be APPROVED student or ADMIN/MODERATOR)
    if (path.includes("/edit")) {
      const isApproved = token.status === "APPROVED";
      const isStaff = token.role === "ADMIN" || token.role === "MODERATOR";

      // If user is neither approved nor staff, send them to their read-only profile view
      if (!isApproved && !isStaff) {
        return NextResponse.redirect(new URL(`/profile/${token.username}`, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true to ensure the middleware function is always called for matched routes
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*/edit", "/login", "/register"],
};
