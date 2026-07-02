import { NextResponse } from "next/server";
import { ContentStorageError, getSiteContentWithStorage, saveSiteContentWithStorage } from "@/lib/content-store";
import { isAdminTokenValid } from "@/lib/keyauth";
import type { SiteContent } from "@/types/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Expires: "0",
  Pragma: "no-cache",
  "Surrogate-Control": "no-store"
};

function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...NO_STORE_HEADERS,
      ...(init?.headers ?? {})
    }
  });
}

export async function GET() {
  const result = await getSiteContentWithStorage();
  return jsonNoStore(result);
}

export async function PUT(request: Request) {
  const token = request.headers.get("x-admin-token") ?? undefined;

  if (!isAdminTokenValid(token)) {
    return jsonNoStore({ message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as { content?: SiteContent };

  if (!body.content) {
    return jsonNoStore({ message: "Missing content payload." }, { status: 400 });
  }

  try {
    const result = await saveSiteContentWithStorage(body.content);
    return jsonNoStore(result);
  } catch (error) {
    if (error instanceof ContentStorageError) {
      return jsonNoStore({ message: error.message, storage: error.storage }, { status: 500 });
    }

    return jsonNoStore({ message: "Content storage failed." }, { status: 500 });
  }
}
