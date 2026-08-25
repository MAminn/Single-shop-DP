/**
 * Noir reference metrics — the measured geometry of the Demo 5 top frame.
 *
 * Every number here was read off the reference screenshot at a 1344px
 * viewport, where the outer frame measures 1312px wide (16px page gutter on
 * each side). Rather than hardcoding those pixels — which would only be
 * correct at exactly 1344px — the frame publishes a CSS length custom
 * property `--nu` ("noir unit") equal to ONE reference pixel:
 *
 *   --nu: calc(100cqw / 1312)
 *
 * `100cqw` resolves against the frame's measuring container, so `--nu` is
 * 1px when the frame is 1312px wide and scales linearly otherwise. Any
 * metric written as `nu(54)` therefore lands on the reference pixel at
 * 1344px and keeps the reference RATIO at every other width.
 *
 * Consumed only by the NoirReference* top-frame components. Nothing else in
 * the codebase reads these.
 */

/** Frame width, in px, at the reference viewport (1344 − 2 × 16 gutter). */
export const NOIR_REF_FRAME_WIDTH = 1312;

/** Page gutter outside the frame — fixed, does not scale. */
export const NOIR_REF_PAGE_GUTTER = 16;

/**
 * One reference pixel as a CSS length. Written onto the frame element as an
 * inline style; every descendant reads it through `nu()`.
 */
export const NOIR_REF_UNIT_DECL = `calc(100cqw / ${NOIR_REF_FRAME_WIDTH})`;

/** Express a reference-screenshot pixel value as a scaling CSS length. */
export function nu(px: number): string {
  return `calc(${px} * var(--nu, 1px))`;
}

/**
 * Same as `nu()` but with a hard floor, for values that must stay legible
 * or tappable when the frame is much narrower than the reference.
 */
export function nuMin(px: number, floorPx: number): string {
  return `max(${floorPx}px, ${nu(px)})`;
}

/* ------------------------------------------------------------------ */
/*  Measured values                                                    */
/* ------------------------------------------------------------------ */

/**
 * HAIRLINES ARE INSET RINGS, NOT BORDERS.
 *
 * The reference's own numbers are only self-consistent if the 1px hairline
 * costs no layout: the card reads 275 x 278 while containing a 148px image
 * and a 130px body (148 + 130 = 278, leaving nothing for borders), and the
 * frame reads 713 while containing 54 + 314 + 345 (= 713, likewise). With
 * additive borders every one of those boxes gains 2px and the error
 * compounds down the frame — which is exactly the +5.1px the frame measured.
 *
 * So the frame, the hero panel and the card draw their hairline with
 * `box-shadow: inset 0 0 0 1px`, which paints inside the border radius
 * identically to a border but occupies no space. Every metric below is
 * therefore a true border-box value.
 */
export const NOIR_REF = {
  frame: {
    radius: 24,
    /**
     * Crop anchor for the ONE shared image mapping. Both the blurred
     * atmosphere and the sharp hero window map onto a box of exactly
     * frame-width x NOIR_REF_FRAME_HEIGHT, so this single value positions the
     * whole picture — there is no per-layer object-position any more.
     */
    imageObjectPosition: "50% 50%",
    /** Gap between the announcement bar and the frame's top edge. */
    topGap: 3,
    /** Space between the last card and the frame's bottom edge. */
    bottomPad: 16,
    maxWidth: 1400,
  },
  announcement: {
    /** Calibrated: reference label is 143px wide, was rendering 122px at 9px. */
    fontSize: 10.5,
    padY: 4,
  },
  navbar: {
    height: 54,
    padStart: 32,
    /** The reference's action cluster ends ~22px short of the frame edge. */
    padEnd: 22,
    /**
     * Logo cap heights already matched (15.4 rendered vs 15 reference), so the
     * 29px width shortfall was letter-spacing, not size. Tracking carries it.
     */
    logoSize: 21,
    logoTracking: "0.53em",
    /** Distance from the logo's end edge to the first nav link. */
    navOffset: 44,
    navGap: 20,
    /**
     * Re-calibrated against a true 1344x752 capture: the nav span measured
     * 253.7->582 against the reference's 252->614, i.e. 32px short.
     */
    linkSize: 15,
    linkTracking: "0.12em",
    actionGap: 24,
    searchIcon: 17,
    /** Cluster measured 141.6 wide against the reference's 162. */
    actionSize: 14.9,
    actionTracking: "0.08em",
  },
  hero: {
    /** Inset of the hero panel inside the frame, each side. */
    insetX: 14,
    /**
     * EXACT reference panel height. Previously this was floored with a 26rem
     * mobile minimum, which resolved to max(416px, 314px) = 416px on desktop
     * and pushed every box below the hero down by ~74px. The mobile floor now
     * lives on a Tailwind class that the md: breakpoint overrides, so this
     * value is authoritative on desktop.
     */
    minHeight: 314,
    /** Mobile-only floor, applied below md and never on desktop. */
    mobileMinHeight: "26rem",
    radius: 16,
    /** Text column inset from the panel's inline-start edge. */
    textStart: 150,
    textTop: 44,
    textBottom: 20,
    /** Calibrated: reference eyebrow is 105px wide, was 87px at 11px. */
    eyebrowSize: 13,
    eyebrowGap: 5.5,
    /** Cap height already matched the reference (45 vs 44) — unchanged. */
    headlineSize: 60,
    /**
     * Explicit line BOX, not a unitless multiplier: 1.117 rendered as a 73px
     * pitch in Antonio against the reference's 67px.
     */
    headlineLineHeight: 67,
    /** Wrap width that reproduces the reference's two-line break. */
    headlineMaxWidth: 430,
    headlineGap: 9,
    /** Calibrated: reference subtitle line 1 is 300px wide, was 245.8 at 10.5px. */
    subSize: 13,
    subLineHeight: 18,
    subMaxWidth: 340,
    subGap: 18,
    ctaHeight: 34,
    ctaPadX: 28,
    ctaGap: 10,
    /** Primary pill measured 105.5 wide against the reference's 115. */
    ctaSize: 13.7,
  },
  bestSellers: {
    headingTop: 17,
    /**
     * 17 OVERSHOT. That value came from a downscaled screenshot; measured at
     * true scale the heading rendered 122.2px wide against the reference's
     * 112px. 15.5 is the corrected size.
     */
    headingSize: 15.5,
    /** Absorbs the 1.5px the smaller heading gives back, keeping the shelf 345. */
    ruleGap: 10.5,
    ruleWidth: 48,
    ruleHeight: 2,
    rowGap: 6,
    /**
     * Row inset from the frame's edge. 70 (not 68) makes the 4-up grid derive
     * a 275px track exactly: (1312 - 140 - 3 x 24) / 4 = 275.
     */
    gutter: 70,
    cardGap: 24,
    cardWidth: 275,
    cardHeight: 278,
  },
  card: {
    radius: 10,
    /**
     * 275 x 148 in the reference, and now exact: the card's hairline is an
     * inset ring rather than a border, so this ratio applies to the full
     * 275px border-box instead of a 273px content box.
     */
    imageAspect: "275 / 148",
    bodyMinHeight: 130,
    /** The reference name sits tight under the image — 4.5px, not 11px. */
    bodyPadTop: 4.5,
    /** 275 - 2 x 39.5 = 196, the reference CTA width. */
    bodyPadX: 39.5,
    bodyPadBottom: 16,
    badgeTop: 11,
    badgeStart: 12,
    badgeSize: 9,
    /** Calibrated: reference name is 64px wide, was 54.8px at 13px. */
    nameSize: 15,
    nameLineHeight: 17,
    notesGap: 4.5,
    notesSize: 13,
    /**
     * Reserved even when the CMS has no notes, so cards never shrink. Matches
     * the notes line box exactly.
     */
    notesLineHeight: 17,
    priceGap: 4,
    priceSize: 16,
    /**
     * Explicit line box. The price previously inherited leading-normal (1.5),
     * which alone made the card body 8px too tall.
     */
    priceLineHeight: 19,
    ctaGap: 14,
    ctaHeight: 34,
    ctaRadius: 6,
    ctaSize: 10.5,
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Derived geometry — the ONE shared image mapping                    */
/* ------------------------------------------------------------------ */

/** The best-sellers band, from the hero panel's bottom to the frame's. */
export const NOIR_REF_SHELF_HEIGHT =
  NOIR_REF.bestSellers.headingTop +
  NOIR_REF.bestSellers.headingSize +
  NOIR_REF.bestSellers.ruleGap +
  NOIR_REF.bestSellers.ruleHeight +
  NOIR_REF.bestSellers.rowGap +
  NOIR_REF.bestSellers.cardHeight +
  NOIR_REF.frame.bottomPad;

/**
 * The frame's nominal height, DERIVED from the parts rather than restated —
 * change any metric above and the image mapping follows it.
 */
export const NOIR_REF_FRAME_HEIGHT =
  NOIR_REF.navbar.height + NOIR_REF.hero.minHeight + NOIR_REF_SHELF_HEIGHT;

/**
 * The single box both image layers map onto: frame width x frame height,
 * `object-fit: cover`, one crop anchor.
 *
 * This is what makes the frame ONE picture. Because the blurred atmosphere and
 * the sharp hero image cover an identically sized box, object-fit derives an
 * identical scale and crop for both — whatever the merchant's artwork aspect
 * turns out to be. The hero panel then simply offsets its copy back to the
 * frame's origin and lets its own `overflow: hidden` clip the window.
 *
 * Previously each layer ran its own `object-cover` against a differently
 * shaped box, which derived scales 1.83x apart and two unrelated crops — the
 * reason the shelf read as a detached grey wash instead of the picture
 * continuing.
 */
export const NOIR_REF_SHARED_IMAGE_BOX = {
  width: nu(NOIR_REF_FRAME_WIDTH),
  height: nu(NOIR_REF_FRAME_HEIGHT),
  objectPosition: NOIR_REF.frame.imageObjectPosition,
} as const;

/** Offset that pulls the hero panel's copy back onto the frame's origin. */
export const NOIR_REF_HERO_IMAGE_OFFSET = {
  x: -NOIR_REF.hero.insetX,
  y: -NOIR_REF.navbar.height,
} as const;
