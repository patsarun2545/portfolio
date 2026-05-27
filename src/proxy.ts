import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getEdgeSession } from "@/lib/edge-auth";
import { validateCSRFToken } from "@/lib/csrf";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page and public API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/contact")) {
    return NextResponse.next();
  }

  // Protect all /admin routes (both pages and API)
  if (pathname.startsWith("/admin")) {
    const session = await getEdgeSession();

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // CSRF protection for state-changing requests on admin API routes
    if (
      pathname.startsWith("/api/admin") &&
      ["POST", "PUT", "DELETE", "PATCH"].includes(request.method)
    ) {
      const csrfToken = request.headers.get("x-csrf-token");

      // CSRF validation for state-changing requests with token rotation
      if (!csrfToken || !(await validateCSRFToken(csrfToken))) {
        return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
      }
    }
  }

  const response = NextResponse.next();
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
