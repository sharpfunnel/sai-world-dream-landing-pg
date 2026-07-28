import { geolocation, ipAddress } from "@vercel/functions";

export interface GeoInfo {
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
}

/**
 * Vercel's edge network injects these headers automatically in production.
 * Read via the official `@vercel/functions` helpers rather than hand-parsing header
 * names — Next.js docs point here now that `NextRequest.geo`/`.ip` were removed in v15,
 * and it stays correct if Vercel ever changes its header set. Absent in local dev,
 * which is fine — fields stay null. `timezone` has no official helper, so it's still
 * read directly off the raw header.
 */
export function readGeoFromHeaders(headers: Headers): GeoInfo {
  const geo = geolocation({ headers });
  return {
    country: geo.country ?? null,
    region: geo.countryRegion ?? null,
    city: geo.city ?? null,
    timezone: headers.get("x-vercel-ip-timezone"),
  };
}

/**
 * `x-real-ip` is Vercel's canonical client-IP header — `@vercel/functions` reads only
 * that one (not `x-forwarded-for`, which isn't part of Vercel's guaranteed header set
 * and was leaving `ipAddress` null for some real requests). Absent in local dev.
 */
export function readIpFromHeaders(headers: Headers): string | null {
  return ipAddress(headers) ?? null;
}
