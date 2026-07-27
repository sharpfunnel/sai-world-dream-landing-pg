import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForToken, exchangeForLongLivedToken, listAdAccounts } from "@/lib/meta/client";

export const runtime = "nodejs";

const STATE_COOKIE = "meta_oauth_state";

export async function GET(request: NextRequest) {
  await verifyAdminSession();

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error_description") ?? request.nextUrl.searchParams.get("error");

  if (oauthError) {
    redirect(`/admin/campaigns?meta_error=${encodeURIComponent(oauthError)}`);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    redirect("/admin/campaigns?meta_error=Invalid+OAuth+state");
  }

  let connectedCount: number;
  try {
    const shortLived = await exchangeCodeForToken(code);
    const longLived = await exchangeForLongLivedToken(shortLived.accessToken);
    const tokenExpiresAt = longLived.expiresIn ? new Date(Date.now() + longLived.expiresIn * 1000) : null;

    const adAccounts = await listAdAccounts(longLived.accessToken);

    await Promise.all(
      adAccounts.map((account) =>
        prisma.metaAdAccount.upsert({
          where: { accountId: account.id },
          create: {
            accountId: account.id,
            name: account.name,
            currency: account.currency,
            timezoneName: account.timezone_name,
            accessToken: longLived.accessToken,
            tokenExpiresAt,
          },
          update: {
            name: account.name,
            currency: account.currency,
            timezoneName: account.timezone_name,
            accessToken: longLived.accessToken,
            tokenExpiresAt,
            lastSyncError: null,
          },
        })
      )
    );

    connectedCount = adAccounts.length;
  } catch (error) {
    console.error("[meta-oauth-callback] failed", error);
    const message = error instanceof Error ? error.message : "Meta connection failed";
    redirect(`/admin/campaigns?meta_error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/campaigns?connected=${connectedCount}`);
}
