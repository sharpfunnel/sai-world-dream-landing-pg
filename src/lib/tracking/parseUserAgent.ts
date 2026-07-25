export interface UserAgentInfo {
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  deviceType: "mobile" | "tablet" | "desktop" | null;
}

const BROWSER_PATTERNS: [RegExp, string][] = [
  [/Edg\/([\d.]+)/, "Edge"],
  [/OPR\/([\d.]+)/, "Opera"],
  [/Chrome\/([\d.]+)/, "Chrome"],
  [/CriOS\/([\d.]+)/, "Chrome"],
  [/FxiOS\/([\d.]+)/, "Firefox"],
  [/Firefox\/([\d.]+)/, "Firefox"],
  [/Version\/([\d.]+).*Safari/, "Safari"],
];

const OS_PATTERNS: [RegExp, string][] = [
  [/Windows NT/, "Windows"],
  [/Mac OS X ([\d_]+)/, "macOS"],
  [/Android ([\d.]+)/, "Android"],
  [/iPhone OS ([\d_]+)/, "iOS"],
  [/iPad; CPU OS ([\d_]+)/, "iPadOS"],
  [/Linux/, "Linux"],
];

export function parseUserAgent(ua: string | null): UserAgentInfo {
  if (!ua) {
    return { browser: null, browserVersion: null, os: null, deviceType: null };
  }

  let browser: string | null = null;
  let browserVersion: string | null = null;
  for (const [pattern, name] of BROWSER_PATTERNS) {
    const match = ua.match(pattern);
    if (match) {
      browser = name;
      browserVersion = match[1] ?? null;
      break;
    }
  }

  let os: string | null = null;
  for (const [pattern, name] of OS_PATTERNS) {
    if (pattern.test(ua)) {
      os = name;
      break;
    }
  }

  const isTablet = /iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua));
  const isMobile = !isTablet && /Mobi|iPhone|Android/.test(ua);
  const deviceType: UserAgentInfo["deviceType"] = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  return { browser, browserVersion, os, deviceType };
}
