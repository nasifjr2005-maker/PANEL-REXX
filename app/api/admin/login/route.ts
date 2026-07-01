import { NextResponse } from "next/server";
import { createAdminToken, verifyKeyAuthUser } from "@/lib/keyauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  const username = body.username?.trim();
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ message: "Enter your KeyAuth username and password." }, { status: 400 });
  }

  try {
    const result = await verifyKeyAuthUser(username, password);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 401 });
    }

    return NextResponse.json({ token: createAdminToken(), message: "Authenticated." });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error && error.message.includes("KEYAUTH")
            ? "KeyAuth environment variables are not configured."
            : "KeyAuth authentication failed."
      },
      { status: 500 }
    );
  }
}
