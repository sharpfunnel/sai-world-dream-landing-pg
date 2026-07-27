import "server-only";

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION ?? "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
const OAUTH_SCOPES = "ads_read,ads_management,business_management";

export class MetaApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "MetaApiError";
    this.status = status;
    this.body = body;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${GRAPH_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json().catch(() => null)) as
    | (T & { error?: { message?: string } })
    | { error?: { message?: string } }
    | null;

  if (!res.ok) {
    const message = (json && "error" in json && json.error?.message) || `Meta Graph API request failed (${res.status})`;
    throw new MetaApiError(message, res.status, json);
  }
  return json as T;
}

interface GraphListResponse<T> {
  data: T[];
  paging?: { cursors?: { after?: string }; next?: string };
}

async function graphListAll<T>(path: string, params: Record<string, string>): Promise<T[]> {
  const results: T[] = [];
  let after: string | undefined;

  for (let page = 0; page < 50; page++) {
    const query = after ? { ...params, after } : params;
    const res = await graphGet<GraphListResponse<T>>(path, query);
    results.push(...res.data);
    after = res.paging?.cursors?.after;
    if (!after || res.data.length === 0) break;
  }

  return results;
}

export function getOAuthDialogUrl(state: string): string {
  const url = new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`);
  url.searchParams.set("client_id", requireEnv("META_APP_ID"));
  url.searchParams.set("redirect_uri", requireEnv("META_REDIRECT_URI"));
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", OAUTH_SCOPES);
  return url.toString();
}

interface TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

export async function exchangeCodeForToken(code: string): Promise<{ accessToken: string; expiresIn?: number }> {
  const data = await graphGet<TokenResponse>("/oauth/access_token", {
    client_id: requireEnv("META_APP_ID"),
    client_secret: requireEnv("META_APP_SECRET"),
    redirect_uri: requireEnv("META_REDIRECT_URI"),
    code,
  });
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export async function exchangeForLongLivedToken(token: string): Promise<{ accessToken: string; expiresIn?: number }> {
  const data = await graphGet<TokenResponse>("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: requireEnv("META_APP_ID"),
    client_secret: requireEnv("META_APP_SECRET"),
    fb_exchange_token: token,
  });
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

export interface MetaAdAccountSummary {
  id: string;
  name: string;
  currency: string;
  timezone_name: string;
}

export async function listAdAccounts(accessToken: string): Promise<MetaAdAccountSummary[]> {
  const data = await graphGet<{ data: MetaAdAccountSummary[] }>("/me/adaccounts", {
    access_token: accessToken,
    fields: "id,name,currency,timezone_name",
    limit: "200",
  });
  return data.data;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
}

export async function listCampaigns(accountId: string, accessToken: string): Promise<MetaCampaign[]> {
  return graphListAll<MetaCampaign>(`/${accountId}/campaigns`, {
    access_token: accessToken,
    fields: "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
    limit: "500",
  });
}

export interface MetaAdSet {
  id: string;
  campaign_id: string;
  name: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  optimization_goal?: string;
  billing_event?: string;
  targeting?: unknown;
}

export async function listAdSets(accountId: string, accessToken: string): Promise<MetaAdSet[]> {
  return graphListAll<MetaAdSet>(`/${accountId}/adsets`, {
    access_token: accessToken,
    fields: "id,campaign_id,name,status,daily_budget,lifetime_budget,optimization_goal,billing_event,targeting",
    limit: "500",
  });
}

export interface MetaAdCreative {
  id: string;
  thumbnail_url?: string;
  body?: string;
  title?: string;
  object_story_spec?: {
    link_data?: { message?: string; name?: string; link?: string; picture?: string };
    video_data?: { message?: string; title?: string; link_url?: string; image_url?: string };
  };
}

export interface MetaAd {
  id: string;
  adset_id: string;
  name: string;
  status: string;
  creative?: MetaAdCreative;
}

export async function listAds(accountId: string, accessToken: string): Promise<MetaAd[]> {
  return graphListAll<MetaAd>(`/${accountId}/ads`, {
    access_token: accessToken,
    fields:
      "id,adset_id,name,status,creative{id,thumbnail_url,body,title,object_story_spec{link_data{message,name,link,picture},video_data{message,title,link_url,image_url}}}",
    limit: "500",
  });
}

export interface MetaActionValue {
  action_type: string;
  value: string;
}

export interface MetaInsightRow {
  date_start: string;
  date_stop: string;
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  inline_link_clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  frequency?: string;
  actions?: MetaActionValue[];
  purchase_roas?: MetaActionValue[];
}

const INSIGHT_FIELDS =
  "date_start,date_stop,campaign_id,adset_id,ad_id,spend,impressions,reach,clicks,inline_link_clicks,ctr,cpc,cpm,frequency,actions,purchase_roas";

export async function getInsights(
  accountId: string,
  level: "campaign" | "adset" | "ad",
  accessToken: string,
  since: string,
  until: string
): Promise<MetaInsightRow[]> {
  return graphListAll<MetaInsightRow>(`/${accountId}/insights`, {
    access_token: accessToken,
    level,
    time_increment: "1",
    time_range: JSON.stringify({ since, until }),
    fields: INSIGHT_FIELDS,
    limit: "500",
  });
}
