import "server-only";
import { prisma } from "@/lib/prisma";
import * as meta from "./client";
import type { MetaAdAccount } from "@/generated/prisma/client";

const RESULT_ACTION_TYPES = new Set([
  "lead",
  "onsite_conversion.lead_grouped",
  "offsite_conversion.fb_pixel_lead",
  "onsite_web_lead",
]);

const TOKEN_REFRESH_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const INSIGHTS_LOOKBACK_DAYS = 30;

function toAmount(minorUnits: string | undefined): number | null {
  return minorUnits ? Number(minorUnits) / 100 : null;
}

function toNumber(value: string | undefined): number {
  return value ? Number(value) : 0;
}

function sumActions(actions: meta.MetaActionValue[] | undefined, types: Set<string>): number {
  if (!actions) return 0;
  return actions.filter((a) => types.has(a.action_type)).reduce((sum, a) => sum + Number(a.value || 0), 0);
}

function extractCreative(creative: meta.MetaAdCreative | undefined) {
  const linkData = creative?.object_story_spec?.link_data;
  const videoData = creative?.object_story_spec?.video_data;
  return {
    creativeId: creative?.id,
    headline: linkData?.name ?? videoData?.title ?? creative?.title,
    bodyText: linkData?.message ?? videoData?.message ?? creative?.body,
    linkUrl: linkData?.link ?? videoData?.link_url,
    thumbnailUrl: linkData?.picture ?? videoData?.image_url ?? creative?.thumbnail_url,
  };
}

function isoDate(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString().slice(0, 10);
}

async function refreshTokenIfNeeded(account: MetaAdAccount): Promise<string> {
  if (!account.accessToken) throw new Error("Account is disconnected");
  if (!account.tokenExpiresAt || account.tokenExpiresAt.getTime() - Date.now() > TOKEN_REFRESH_WINDOW_MS) {
    return account.accessToken;
  }

  const { accessToken, expiresIn } = await meta.exchangeForLongLivedToken(account.accessToken);
  await prisma.metaAdAccount.update({
    where: { id: account.id },
    data: {
      accessToken,
      tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
    },
  });
  return accessToken;
}

async function upsertInsightRows(
  level: "campaign" | "adset" | "ad",
  rows: meta.MetaInsightRow[],
  idByMetaId: Map<string, string>
) {
  for (const row of rows) {
    const metaEntityId = level === "campaign" ? row.campaign_id : level === "adset" ? row.adset_id : row.ad_id;
    if (!metaEntityId) continue;
    const entityId = idByMetaId.get(metaEntityId);
    if (!entityId) continue;

    const spend = toNumber(row.spend);
    const results = sumActions(row.actions, RESULT_ACTION_TYPES);
    const roasEntry = row.purchase_roas?.[0];

    const data = {
      level,
      entityId,
      date: new Date(row.date_start),
      campaignId: level === "campaign" ? entityId : null,
      adSetId: level === "adset" ? entityId : null,
      adId: level === "ad" ? entityId : null,
      spend,
      impressions: Math.round(toNumber(row.impressions)),
      reach: Math.round(toNumber(row.reach)),
      clicks: Math.round(toNumber(row.clicks)),
      linkClicks: Math.round(toNumber(row.inline_link_clicks)),
      landingPageViews: Math.round(sumActions(row.actions, new Set(["landing_page_view"]))),
      ctr: toNumber(row.ctr),
      cpc: toNumber(row.cpc),
      cpm: toNumber(row.cpm),
      frequency: toNumber(row.frequency),
      videoViews: Math.round(sumActions(row.actions, new Set(["video_view"]))),
      results: Math.round(results),
      costPerResult: results ? spend / results : null,
      roas: roasEntry ? Number(roasEntry.value) : null,
    };

    await prisma.metaInsight.upsert({
      where: { level_entityId_date: { level, entityId, date: data.date } },
      create: data,
      update: data,
    });
  }
}

export async function syncMetaAdAccount(account: MetaAdAccount): Promise<void> {
  try {
    const accessToken = await refreshTokenIfNeeded(account);

    const [campaigns, adSets, ads] = await Promise.all([
      meta.listCampaigns(account.accountId, accessToken),
      meta.listAdSets(account.accountId, accessToken),
      meta.listAds(account.accountId, accessToken),
    ]);

    for (const c of campaigns) {
      await prisma.campaign.upsert({
        where: { metaId: c.id },
        create: {
          metaId: c.id,
          adAccountId: account.id,
          name: c.name,
          status: c.status,
          objective: c.objective,
          dailyBudget: toAmount(c.daily_budget),
          lifetimeBudget: toAmount(c.lifetime_budget),
          startTime: c.start_time ? new Date(c.start_time) : null,
          stopTime: c.stop_time ? new Date(c.stop_time) : null,
        },
        update: {
          name: c.name,
          status: c.status,
          objective: c.objective,
          dailyBudget: toAmount(c.daily_budget),
          lifetimeBudget: toAmount(c.lifetime_budget),
          startTime: c.start_time ? new Date(c.start_time) : null,
          stopTime: c.stop_time ? new Date(c.stop_time) : null,
        },
      });
    }

    const campaignIdByMetaId = new Map(
      (
        await prisma.campaign.findMany({ where: { adAccountId: account.id }, select: { id: true, metaId: true } })
      ).map((c) => [c.metaId, c.id])
    );

    for (const as of adSets) {
      const campaignId = campaignIdByMetaId.get(as.campaign_id);
      if (!campaignId) continue;
      await prisma.adSet.upsert({
        where: { metaId: as.id },
        create: {
          metaId: as.id,
          campaignId,
          name: as.name,
          status: as.status,
          dailyBudget: toAmount(as.daily_budget),
          lifetimeBudget: toAmount(as.lifetime_budget),
          optimizationGoal: as.optimization_goal,
          billingEvent: as.billing_event,
          targeting: as.targeting ?? undefined,
        },
        update: {
          name: as.name,
          status: as.status,
          dailyBudget: toAmount(as.daily_budget),
          lifetimeBudget: toAmount(as.lifetime_budget),
          optimizationGoal: as.optimization_goal,
          billingEvent: as.billing_event,
          targeting: as.targeting ?? undefined,
        },
      });
    }

    const adSetIdByMetaId = new Map(
      (
        await prisma.adSet.findMany({
          where: { campaign: { adAccountId: account.id } },
          select: { id: true, metaId: true },
        })
      ).map((a) => [a.metaId, a.id])
    );

    for (const ad of ads) {
      const adSetId = adSetIdByMetaId.get(ad.adset_id);
      if (!adSetId) continue;
      const creative = extractCreative(ad.creative);
      await prisma.ad.upsert({
        where: { metaId: ad.id },
        create: { metaId: ad.id, adSetId, name: ad.name, status: ad.status, ...creative },
        update: { name: ad.name, status: ad.status, ...creative },
      });
    }

    const adIdByMetaId = new Map(
      (
        await prisma.ad.findMany({
          where: { adSet: { campaign: { adAccountId: account.id } } },
          select: { id: true, metaId: true },
        })
      ).map((a) => [a.metaId, a.id])
    );

    const since = isoDate(INSIGHTS_LOOKBACK_DAYS);
    const until = isoDate(0);

    const [campaignInsights, adSetInsights, adInsights] = await Promise.all([
      meta.getInsights(account.accountId, "campaign", accessToken, since, until),
      meta.getInsights(account.accountId, "adset", accessToken, since, until),
      meta.getInsights(account.accountId, "ad", accessToken, since, until),
    ]);

    await upsertInsightRows("campaign", campaignInsights, campaignIdByMetaId);
    await upsertInsightRows("adset", adSetInsights, adSetIdByMetaId);
    await upsertInsightRows("ad", adInsights, adIdByMetaId);

    await prisma.metaAdAccount.update({
      where: { id: account.id },
      data: { lastSyncedAt: new Date(), lastSyncError: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    console.error(`[meta-sync] failed for account ${account.accountId}`, error);
    await prisma.metaAdAccount.update({
      where: { id: account.id },
      data: { lastSyncedAt: new Date(), lastSyncError: message },
    });
  }
}

export async function syncAllMetaAdAccounts(): Promise<{ synced: number; failed: number }> {
  const accounts = await prisma.metaAdAccount.findMany({ where: { accessToken: { not: null } } });
  let failed = 0;

  for (const account of accounts) {
    await syncMetaAdAccount(account);
    const refreshed = await prisma.metaAdAccount.findUnique({ where: { id: account.id }, select: { lastSyncError: true } });
    if (refreshed?.lastSyncError) failed++;
  }

  return { synced: accounts.length - failed, failed };
}
