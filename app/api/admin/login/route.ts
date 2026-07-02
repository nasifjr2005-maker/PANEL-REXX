import { NextResponse } from "next/server";
import { createAdminToken, getServerEnvDiagnostics, isMissingServerEnvError, verifyKeyAuthUser } from "@/lib/keyauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function environmentErrorResponse(missing: readonly string[], warnings: readonly string[] = []) {
  const location = process.env.NETLIFY ? "Netlify Functions runtime" : "server runtime";
  const variableList = missing.join(", ");
  const warningText = warnings.length ? ` ${warnings.join(" ")}` : "";

  return NextResponse.json(
    {
      message: `${location} is missing required environment variables: ${variableList}. Add them in Netlify Site configuration > Environment variables, include the Functions scope, then redeploy.${warningText}`,
      missing,
      warnings
    },
    { status: 500 }
  );
}

export async function POST(request: Request) {
  const diagnostics = getServerEnvDiagnostics();
  if (!diagnostics.ready) {
    return environmentErrorResponse(diagnostics.missing, diagnostics.warnings);
  }

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
    if (isMissingServerEnvError(error)) {
      return environmentErrorResponse(error.missing);
    }

    return NextResponse.json(
      {
        message: "KeyAuth authentication failed."
      },
      { status: 500 }
    );
  }
}
