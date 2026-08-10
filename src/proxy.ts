import { NextRequest, NextResponse } from "next/server";

/**
 * Protects the /admin area (and its server actions) with HTTP Basic Auth.
 *
 * Set `ADMIN_PASSWORD` (and optionally `ADMIN_USER`, default "admin") in the
 * environment. Behaviour when `ADMIN_PASSWORD` is unset:
 *   - production  → deny (503, fail-closed) so an unconfigured deploy can't leak
 *   - development → allow (so local `npm run dev` admin stays frictionless)
 */
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

export function proxy(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  const expectedUser = process.env.ADMIN_USER || "admin";

  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse(
        "Admin is not configured. Set the ADMIN_PASSWORD environment variable.",
        { status: 503 },
      );
    }
    return NextResponse.next();
  }

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(":");
      const user = decoded.slice(0, sep);
      const pass = decoded.slice(sep + 1);
      if (user === expectedUser && timingSafeEqual(pass, expected)) {
        return NextResponse.next();
      }
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="SevaKhoj Admin", charset="UTF-8"' },
  });
}

/** Length-aware constant-time-ish string comparison. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
