import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
  createAdminSessionToken,
  credentialsMatch,
} from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ungültige Anfrage." },
      { status: 400 },
    );
  }

  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!credentialsMatch(username, password)) {
    return NextResponse.json(
      { ok: false, error: "Benutzername oder Passwort ist falsch." },
      { status: 401 },
    );
  }

  const token = createAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  });

  return response;
}
