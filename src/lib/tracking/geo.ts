export interface GeoInfo {
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
}

/**
 * Vercel's edge network injects these headers automatically in production.
 * They are absent in local dev, which is fine — fields stay null.
 */
export function readGeoFromHeaders(headers: Headers): GeoInfo {
  const city = headers.get("x-vercel-ip-city");
  return {
    country: headers.get("x-vercel-ip-country"),
    region: headers.get("x-vercel-ip-country-region"),
    city: city ? decodeURIComponent(city) : null,
    timezone: headers.get("x-vercel-ip-timezone"),
  };
}
