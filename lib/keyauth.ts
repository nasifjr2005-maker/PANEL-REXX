import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const KEYAUTH_API_URL = "https://keyauth.win/api/1.3/";
const REQUIRED_SERVER_ENV = ["KEYAUTH_NAME", "KEYAUTH_OWNER_ID", "ADMIN_SESSION_SECRET"] as const;

type RequiredServerEnv = (typeof REQUIRED_SERVER_ENV)[number];

export class MissingServerEnvError extends Error {
  missing: RequiredServerEnv[];

  constructor(missing: RequiredServerEnv[]) {
    super(`Missing server environment variables: ${missing.join(", ")}`);
    this.name = "MissingServerEnvError";
    this.missing = missing;
  }
}

type KeyAuthInitResponse = {
  success: boolean;
  sessionid?: string;
  message?: string;
};

type KeyAuthLoginResponse = {
  success: boolean;
  message?: string;
};

function cleanEnvValue(name: string, value: string | undefined) {
  if (!value) {
    return "";
  }

  let cleaned = value.trim();

  if ((cleaned.startsWith("\"") && cleaned.endsWith("\"")) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  const copiedLinePrefix = new RegExp(`^${name}\\s*=`, "i");
  if (copiedLinePrefix.test(cleaned)) {
    cleaned = cleaned.replace(copiedLinePrefix, "").trim();
  }

  if ((cleaned.startsWith("\"") && cleaned.endsWith("\"")) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

function envValue(name: string) {
  return cleanEnvValue(name, process.env[name]);
}

function requiredEnv(name: RequiredServerEnv) {
  const value = envValue(name);
  if (!value) {
    throw new MissingServerEnvError([name]);
  }
  return value;
}

export function getServerEnvDiagnostics() {
  const missing = REQUIRED_SERVER_ENV.filter((name) => !envValue(name));
  const warnings: string[] = [];

  if (!envValue("KEYAUTH_SECRET")) {
    warnings.push("KEYAUTH_SECRET is blank. Add it to Netlify with the rest of the KeyAuth variables.");
  }

  if (envValue("ADMIN_SESSION_SECRET") === "your-long-random-secret") {
    warnings.push("ADMIN_SESSION_SECRET is still using the placeholder value.");
  }

  return {
    ready: missing.length === 0,
    missing,
    warnings
  };
}

export function isMissingServerEnvError(error: unknown): error is MissingServerEnvError {
  return error instanceof MissingServerEnvError;
}

async function callKeyAuth(params: Record<string, string>) {
  const url = new URL(KEYAUTH_API_URL);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("KeyAuth request failed");
  }

  return response.json() as Promise<KeyAuthInitResponse | KeyAuthLoginResponse>;
}

function getKeyAuthHwid(name: string, ownerid: string) {
  const explicitHwid = envValue("KEYAUTH_HWID");

  if (explicitHwid) {
    return explicitHwid;
  }

  const seed = [
    envValue("ADMIN_SESSION_SECRET"),
    ownerid,
    name,
    "panel-rexx-admin"
  ]
    .filter(Boolean)
    .join(":");
  const digest = createHash("sha256").update(seed).digest("hex").slice(0, 32);

  return `panel-rexx-web-${digest}`;
}

export async function verifyKeyAuthUser(username: string, password: string) {
  const name = requiredEnv("KEYAUTH_NAME");
  const ownerid = requiredEnv("KEYAUTH_OWNER_ID");
  const version = envValue("KEYAUTH_VERSION") || "1.0";
  const hwid = getKeyAuthHwid(name, ownerid);

  const init = (await callKeyAuth({
    type: "init",
    name,
    ownerid,
    ver: version
  })) as KeyAuthInitResponse;

  if (!init.success || !init.sessionid) {
    return {
      success: false,
      message: init.message ?? "KeyAuth initialization failed."
    };
  }

  const loginPayload: Record<string, string> = {
    type: "login",
    username,
    pass: password,
    name,
    ownerid,
    sessionid: init.sessionid,
    hwid
  };

  const login = (await callKeyAuth(loginPayload)) as KeyAuthLoginResponse;

  return {
    success: Boolean(login.success),
    message: login.message ?? (login.success ? "Authenticated." : "Login rejected.")
  };
}

export function createAdminToken() {
  const secret = requiredEnv("ADMIN_SESSION_SECRET");
  const payload = Buffer.from(JSON.stringify({ createdAt: Date.now(), nonce: randomUUID() })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isAdminTokenValid(token: string | undefined) {
  const secret = envValue("ADMIN_SESSION_SECRET");
  if (!secret || !token) {
    return false;
  }

  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) {
      return false;
    }

    const expected = createHmac("sha256", secret).update(payload).digest("base64url");
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return false;
    }

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { createdAt?: number };
    const age = Date.now() - Number(decoded.createdAt);
    return Number.isFinite(age) && age >= 0 && age < 1000 * 60 * 60 * 12;
  } catch {
    return false;
  }
}
