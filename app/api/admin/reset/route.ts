import { NextResponse } from "next/server";
import { resetSiteContent } from "@/lib/content-store";
import { isAdminTokenValid } from "@/lib/keyauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = request.headers.get("x-admin-token") ?? undefined;

  if (!isAdminTokenValid(token)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const content = await resetSiteContent();
  return NextResponse.json({ content });
}
