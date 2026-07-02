import { NextResponse } from "next/server";
import { ContentStorageError, resetSiteContentWithStorage } from "@/lib/content-store";
import { isAdminTokenValid } from "@/lib/keyauth";

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

export async function POST(request: Request) {
  const token = request.headers.get("x-admin-token") ?? undefined;

  if (!isAdminTokenValid(token)) {
    return jsonNoStore({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await resetSiteContentWithStorage();
    return jsonNoStore(result);
  } catch (error) {
    if (error instanceof ContentStorageError) {
      return jsonNoStore({ message: error.message, storage: error.storage }, { status: 500 });
    }

    return jsonNoStore({ message: "Content reset failed." }, { status: 500 });
  }
}
