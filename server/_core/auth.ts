import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

export type SessionPayload = {
  userId: string;
  username: string;
};

function getSecret() {
  return new TextEncoder().encode(ENV.cookieSecret || "dev-secret-change-in-production");
}

export async function signSession(payload: SessionPayload, expiresInMs = 365 * 24 * 60 * 60 * 1000): Promise<string> {
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);
  return new SignJWT({ userId: payload.userId, username: payload.username })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    const { userId, username } = payload as Record<string, unknown>;
    if (typeof userId !== "string" || typeof username !== "string") return null;
    return { userId, username };
  } catch {
    return null;
  }
}
