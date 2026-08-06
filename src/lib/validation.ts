const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_RE = /^\+?[0-9\s\-()]+$/;
const NAME_RE = /^[A-Za-z\s'.-]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

// Requires exactly 10 digits — matches Indian mobile numbers (the site's target audience).
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!PHONE_CHARS_RE.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length === 10;
}

export function isValidName(value: string): boolean {
  return NAME_RE.test(value.trim());
}

// Live-typing filter: strips disallowed characters and caps digit count.
export function sanitizePhoneInput(value: string): string {
  const cleaned = value.replace(/[^0-9\s\-+()]/g, "");
  let digitCount = 0;
  let result = "";
  for (const char of cleaned) {
    if (/[0-9]/.test(char)) {
      digitCount += 1;
      if (digitCount > 10) continue;
    }
    result += char;
  }
  return result;
}

// Live-typing filter: letters, spaces, apostrophes, periods, hyphens only.
export function sanitizeNameInput(value: string): string {
  return value.replace(/[^A-Za-z\s'.-]/g, "");
}
