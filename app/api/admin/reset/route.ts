import { NextResponse } from "next/server";
import { ContentStorageError, resetSiteContentWithStorage } from "@/lib/content-store";
import { isAdminTokenValid } from "@/lib/keyauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = request.headers.get("x-admin-token") ?? undefined;

  if (!isAdminTokenValid(token)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await resetSiteContentWithStorage();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ContentStorageError) {
      return NextResponse.json({ message: error.message, storage: error.storage }, { status: 500 });
    }

    return NextResponse.json({ message: "Content reset failed." }, { status: 500 });
  }
}
