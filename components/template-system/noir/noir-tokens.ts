/**
 * Noir (Demo 5) — design tokens.
 *
 * Single source of truth for the Noir design language: dark luxury
 * storefront (black canvas, signal-red accent, condensed uppercase
 * typography, dark glass cards). Every Noir component imports from here
 * so styling stays consistent across phases.
 */

export const NOIR_COLORS = {
  bgBase: "#000000",
  bgElevated: "#101010",
  card: "#141414",
  border: "rgba(255,255,255,0.10)",
  textPrimary: "#FFFFFF",
  textSecondary: "#A3A3A3",
  textMuted: "#6B6B6B",
  accent: "#E8112D",
  accentHover: "#C40E26",
} as const;

/* ------------------------------------------------------------------ */
/*  Reusable Tailwind arbitrary-value class strings                    */
/* ------------------------------------------------------------------ */

/** Dark glass card surface. */
export const NOIR_CARD_CLASSES =
  "bg-[#141414] border border-white/10 rounded-lg";

/** Hairline border used on dividers and outlined elements. */
export const NOIR_BORDER_CLASSES = "border border-white/10";

/** Card hover treatment: border brightens + slight lift. */
export const NOIR_CARD_HOVER_CLASSES =
  "transition-all duration-300 hover:border-white/25 hover:-translate-y-1";

/** Secondary body text. */
export const NOIR_TEXT_SECONDARY_CLASSES = "text-[#A3A3A3]";

/** Muted/tertiary text. */
export const NOIR_TEXT_MUTED_CLASSES = "text-[#6B6B6B]";

/** Signal-red accent text. */
export const NOIR_ACCENT_TEXT_CLASSES = "text-[#E8112D]";

/** Signal-red accent surface with hover darkening. */
export const NOIR_ACCENT_BG_CLASSES = "bg-[#E8112D] hover:bg-[#C40E26]";

/** Condensed display font (Oswald) — variable defined in the scoped Noir CSS block. */
export const NOIR_DISPLAY_FONT_CLASSES =
  "[font-family:var(--noir-font-display)]";

/** Mono font (IBM Plex Mono) — variable defined in the scoped Noir CSS block. */
export const NOIR_MONO_FONT_CLASSES = "[font-family:var(--noir-font-mono)]";
