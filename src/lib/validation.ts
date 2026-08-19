const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_RE = /^\+?[0-9\s\-()]+$/;
const NAME_RE = /^[A-Za-z\s'.-]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

// Requires exactly 10 digits — matches Indian mobile numbers (the site's target audience).
// A leading +91 / 91 / 0 trunk prefix is stripped first so "+91 9876543210" still validates.
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!PHONE_CHARS_RE.test(trimmed)) return false;
  const digits = stripCountryPrefix(trimmed.replace(/\D/g, ""));
  return digits.length === 10;
}

function stripCountryPrefix(digits: string): string {
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function isValidName(value: string): boolean {
  return NAME_RE.test(value.trim());
}

// Live-typing filter: strips disallowed characters and caps digit count at 10,
// exempting a leading +91 / 91 / 0 trunk prefix so it doesn't eat into the number itself.
export function sanitizePhoneInput(value: string): string {
  const cleaned = value.replace(/[^0-9\s\-+()]/g, "");
  const digitsOnly = cleaned.replace(/\D/g, "");

  let prefixDigitsAllowed = 0;
  if (cleaned.trimStart().startsWith("+")) {
    prefixDigitsAllowed = Math.min(3, digitsOnly.length);
  } else if (digitsOnly.length > 10 && digitsOnly.startsWith("91")) {
    prefixDigitsAllowed = 2;
  } else if (digitsOnly.length > 10 && digitsOnly.startsWith("0")) {
    prefixDigitsAllowed = 1;
  }

  let digitCount = 0;
  let result = "";
  for (const char of cleaned) {
    if (/[0-9]/.test(char)) {
      digitCount += 1;
      if (digitCount > 10 + prefixDigitsAllowed) continue;
    }
    result += char;
  }
  return result;
}

// Live-typing filter: letters, spaces, apostrophes, periods, hyphens only.
export function sanitizeNameInput(value: string): string {
  return value.replace(/[^A-Za-z\s'.-]/g, "");
}
