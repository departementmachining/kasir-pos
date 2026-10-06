import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "kasir_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

type SessionData = {
  userId: string;
  expiresAt: number;
};

function encodeSession(data: SessionData): string {
  const payload = JSON.stringify(data);
  return Buffer.from(payload).toString("base64url");
}

function decodeSession(value: string): SessionData | null {
  try {
    const payload = Buffer.from(value, "base64url").toString("utf8");
    const data = JSON.parse(payload) as SessionData;

    if (
      typeof data.userId !== "string" ||
      typeof data.expiresAt !== "number"
    ) {
      return null;
    }

    if (Date.now() >= data.expiresAt) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;

  const sessionValue = encodeSession({
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: sessionValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  const session = decodeSession(sessionCookie.value);

  if (!session) {
    await destroySession();
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    include: {
      role: true,
      company: true,
      branch: true,
    },
  });

  if (!user) {
    await destroySession();
    return null;
  }

  if (user.status !== "ACTIVE") {
    await destroySession();
    return null;
  }

  return user;
}

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}
