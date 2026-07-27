import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth/dal";
import { getOAuthDialogUrl } from "@/lib/meta/client";

export const runtime = "nodejs";

const STATE_COOKIE = "meta_oauth_state";

export async function GET() {
  await verifyAdminSession();

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  redirect(getOAuthDialogUrl(state));
}
