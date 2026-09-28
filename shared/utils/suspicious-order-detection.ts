/**
 * Lightweight, transparent heuristics for flagging orders worth a human's
 * second look — never for blocking checkout. Each signal alone is weak and
 * can hit real customers (an unusual real name, a webmail alias); two or
 * more together is the actual flag. See isOrderSuspicious().
 *
 * Deliberately scoped: reliably detecting "gibberish" across scripts as
 * different as Latin and Arabic isn't a solved problem. Arabic doesn't write
 * short vowels, so the vowel/consonant-run trick below only applies to
 * Latin-script text — we skip it entirely for Arabic rather than fake a
 * version that doesn't actually work.
 */

const VOWELS = new Set(["a", "e", "i", "o", "u"]);
const ARABIC_SCRIPT_RE = /[؀-ۿ]/;
const KEYBOARD_MASH_PATTERNS = [
  "asdfgh",
  "asdf",
  "qwertyuiop",
  "qwerty",
  "zxcvbn",
  "zxcv",
  "qazwsx",
];

function containsArabicScript(text: string): boolean {
  return ARABIC_SCRIPT_RE.test(text);
}

/** A single unbroken word where a real full name would have a space.
 * Returns the letter count so callers can weigh how unusual it is — a real
 * customer occasionally has a genuine single-word name; a 17-character one
 * with zero spaces essentially never happens. */
function unbrokenTokenLetterCount(name: string): number | null {
  const letters = name.replace(/[^\p{L}]/gu, "");
  if (/\s/.test(name.trim()) || letters.length < 8) return null;
  return letters.length;
}

/** Longest run of 5+ consecutive consonants with no vowel — effectively
 * unpronounceable in Latin script. Non-letters (digits, punctuation) break
 * the run rather than counting as consonants. */
function hasLongConsonantRun(text: string): boolean {
  const lower = text.toLowerCase();
  let run = 0;
  for (const ch of lower) {
    if (ch >= "a" && ch <= "z" && !VOWELS.has(ch)) {
      run++;
      if (run >= 5) return true;
    } else {
      run = 0;
    }
  }
  return false;
}

/** Keyboard-row mashing (asdf, qwerty, ...) or 4+ identical chars in a row. */
function matchesKeyboardMash(text: string): boolean {
  const lower = text.toLowerCase();
  if (/(.)\1{3,}/.test(lower)) return true;
  return KEYBOARD_MASH_PATTERNS.some((pattern) => lower.includes(pattern));
}

/** Rough "does this email plausibly belong to this name" check — true if
 * any 3+ letter chunk of the name appears in the email's local part. */
function emailLocalResemblesName(emailLocal: string, name: string): boolean {
  const localLetters = emailLocal.toLowerCase().replace(/[^a-z]/g, "");
  const nameParts = name
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean);
  return nameParts.some(
    (part) => part.length >= 3 && localLetters.includes(part.slice(0, 3)),
  );
}

export interface SuspiciousOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

/** Returns every matched red flag, in plain language for an admin to read.
 * An empty array means nothing looked off. */
export function detectSuspiciousSignals(
  input: SuspiciousOrderInput,
): string[] {
  const reasons: string[] = [];
  const name = input.customerName.trim();
  const emailLocal = input.customerEmail.split("@")[0] ?? "";

  const unbrokenLetters = unbrokenTokenLetterCount(name);
  if (unbrokenLetters !== null) {
    reasons.push("Name has no spaces — a single unbroken word");
    // A short single-word name happens for real customers; one this long
    // essentially never does — weigh it as two signals on its own.
    if (unbrokenLetters >= 12) {
      reasons.push("Unbroken name is unusually long (12+ letters)");
    }
  }

  if (!containsArabicScript(name) && hasLongConsonantRun(name)) {
    reasons.push("Name contains an unpronounceable run of consonants");
  }

  if (
    matchesKeyboardMash(name) ||
    matchesKeyboardMash(emailLocal) ||
    matchesKeyboardMash(input.customerPhone)
  ) {
    reasons.push(
      "Contains a keyboard-mash pattern (e.g. asdf, qwerty, or a repeated character)",
    );
  }

  if (
    !containsArabicScript(emailLocal) &&
    hasLongConsonantRun(emailLocal) &&
    !emailLocalResemblesName(emailLocal, name)
  ) {
    reasons.push("Email doesn't resemble the name and looks unpronounceable");
  }

  return reasons;
}

/** Two or more independent red flags is the actual threshold for flagging —
 * any single one alone is too weak (real unusual names exist). */
export function isOrderSuspicious(reasons: string[]): boolean {
  return reasons.length >= 2;
}
