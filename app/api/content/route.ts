import { NextResponse } from "next/server";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import { isAdminTokenValid } from "@/lib/keyauth";
import type { SiteContent } from "@/types/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
  const token = request.headers.get("x-admin-token") ?? undefined;

  if (!isAdminTokenValid(token)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { content?: SiteContent };

  if (!body.content) {
    return NextResponse.json({ message: "Missing content payload." }, { status: 400 });
  }

  const content = await saveSiteContent(body.content);
  return NextResponse.json({ content });
}
