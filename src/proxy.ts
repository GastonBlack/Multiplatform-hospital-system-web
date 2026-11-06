import { NextResponse, type NextRequest } from "next/server";
import { safeReturnPath } from "@/lib/auth/return-path";

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  // Overwrite client-supplied values; this header never grants permissions.
  headers.set(
    "x-mhs-return-path",
    safeReturnPath(request.nextUrl.pathname + request.nextUrl.search),
  );
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/", "/profile", "/admin/:path*"] };
