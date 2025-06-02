// This file is disabled since we now handle auth checks at the layout level

// import { createServerClient } from "@supabase/ssr";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

export const config = {
  matcher: [], // Empty matcher to disable middleware completely
};

// The middleware function is no longer needed as we handle auth in the layout
// export async function middleware(request: NextRequest) {
//   return NextResponse.next();
// }