import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  // Add request timing header
  const duration = Date.now() - start;
  response.headers.set("x-proxy-timing", `${duration}ms`);

  // Add request path header (useful for debugging)
  response.headers.set("x-request-path", request.nextUrl.pathname);

  // Add request timestamp
  response.headers.set("x-request-timestamp", new Date().toISOString());

  return response;
}

// Match all routes except static files and API routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
