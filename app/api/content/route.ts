import { NextResponse } from "next/server";
import { ContentStorageError, getSiteContentWithStorage, saveSiteContentWithStorage } from "@/lib/content-store";
import { isAdminTokenValid } from "@/lib/keyauth";
import type { SiteContent } from "@/types/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getSiteContentWithStorage();
  return NextResponse.json(result);
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

  try {
    const result = await saveSiteContentWithStorage(body.content);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ContentStorageError) {
      return NextResponse.json({ message: error.message, storage: error.storage }, { status: 500 });
    }

    return NextResponse.json({ message: "Content storage failed." }, { status: 500 });
  }
}
