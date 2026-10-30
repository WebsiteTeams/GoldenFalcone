import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type SessionOptions } from "iron-session";
import { Types } from "mongoose";
import type { AdminRole } from "@/lib/admin/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { Session } from "@/models/Session";

export const SESSION_COOKIE = "gf_admin_session";

const SHORT_SESSION_MS = 12 * 60 * 60 * 1000; // browser-session cookie, 12h server-side limit
const REMEMBER_SESSION_S = 30 * 24 * 60 * 60; // "remember me": persistent cookie, 30 days
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

type CookieData = { sid?: string };

export type CurrentAdmin = { id: string; email: string; name: string; role: AdminRole; sessionId: string };

export class AuthNotConfiguredError extends Error {
  constructor() {
    super("SESSION_SECRET must be set to a random string of at least 32 characters");
    this.name = "AuthNotConfiguredError";
  }
}

function sessionOptions(remember = false): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) throw new AuthNotConfiguredError();
  return {
    password,
    cookieName: SESSION_COOKIE,
    ttl: remember ? REMEMBER_SESSION_S : 0,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // Without "remember me" the cookie is dropped when the browser closes.
      ...(remember ? {} : { maxAge: undefined }),
    },
  };
}

const readCookie = async () => getIronSession<CookieData>(await cookies(), sessionOptions());

/**
 * Resolves the signed-in admin from the encrypted cookie and the server-side session record.
 * Cached per request, so layouts, pages and handlers can all call it cheaply.
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  let sid: string | undefined;
  try {
    sid = (await readCookie()).sid;
  } catch {
    return null; // auth not configured, or a tampered / undecryptable cookie
  }
  if (!sid || !Types.ObjectId.isValid(sid)) return null;

  await connectToDatabase();
  const session = await Session.findOne({ _id: sid, expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;
  const admin = await Admin.findOne({ _id: session.admin, active: true }).lean();
  if (!admin) return null;

  if (!session.lastSeenAt || Date.now() - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await Session.updateOne({ _id: sid }, { lastSeenAt: new Date() }).catch(() => undefined);
  }

  return { id: String(admin._id), email: admin.email, name: admin.name, role: admin.role as AdminRole, sessionId: sid };
});

/** For admin pages: redirects to the login screen unless signed in (and, optionally, holding the given role). */
export async function requireAdmin(role?: AdminRole) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (role === "admin" && admin.role !== "admin") redirect("/admin/dashboard?denied=1");
  return admin;
}

export async function createSession(adminId: string, remember: boolean, meta: { userAgent?: string; ip?: string }) {
  const options = sessionOptions(remember);
  const expiresAt = new Date(Date.now() + (remember ? REMEMBER_SESSION_S * 1000 : SHORT_SESSION_MS));
  const session = await Session.create({
    admin: adminId,
    expiresAt,
    userAgent: meta.userAgent?.slice(0, 300),
    ip: meta.ip?.slice(0, 64),
  });
  const cookie = await getIronSession<CookieData>(await cookies(), options);
  cookie.sid = String(session._id);
  await cookie.save();
}

export async function destroySession() {
  try {
    const cookie = await readCookie();
    if (cookie.sid && Types.ObjectId.isValid(cookie.sid)) {
      await connectToDatabase();
      await Session.deleteOne({ _id: cookie.sid });
    }
    cookie.destroy();
  } catch {
    (await cookies()).delete(SESSION_COOKIE);
  }
}

/** Revokes every other session for this admin (used after a password change). */
export async function revokeOtherSessions(adminId: string, keepSessionId: string) {
  await Session.deleteMany({ admin: adminId, _id: { $ne: keepSessionId } });
}
