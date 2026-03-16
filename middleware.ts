import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {

  const auth = req.headers.get("authorization");

  if (auth) {
    const [user, pass] = atob(auth.split(" ")[1]).split(":");

    if (user === "admin" && pass === "tdn@12345") {
      return NextResponse.next();
    }
  }

  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: "/:path*",
};
