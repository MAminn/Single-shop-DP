import { onRenderHtml as vikeReactOnRenderHtml } from "vike-react/__internal/integration/onRenderHtml";
import type { OnRenderHtmlAsync } from "vike/types";

/**
 * Wraps vike-react's own onRenderHtml (identical HTML output) and adds an
 * injectFilter that trims <link rel="preload"> tags.
 *
 * layouts/style.css imports the full @fontsource families (Poppins, Roboto
 * Flex, Rubik), and Vike preloads EVERY subset file those CSS files reference:
 * ~34 font files / ~500KB on every page, all requested at the same instant as
 * the hero image. On a slow connection that starves the LCP image (measured:
 * ~5.7s "resource load duration" on real 4G throttling).
 *
 * Browsers only download an unicode-range subset when the page actually renders
 * a glyph from it, so the Cyrillic / Greek / Hebrew / Vietnamese / Devanagari /
 * Latin-Extended subsets never load on their own — they were only downloaded
 * because of the preload hint. Dropping the hint for those changes nothing
 * visually; the Latin and Arabic subsets (the ones this store renders) stay
 * preloaded exactly as before, and any rarely-used subset still loads on demand.
 */
const UNUSED_FONT_SUBSET =
  /-(cyrillic|cyrillic-ext|greek|greek-ext|hebrew|vietnamese|devanagari|latin-ext)(-[a-z0-9]+)*[.-][A-Za-z0-9_-]*\.(woff2?|ttf|otf)(\?|$)/;

const onRenderHtml: OnRenderHtmlAsync = async (pageContext) => {
  // vike-react returns the escapeInject`...` template (the documentHtml) directly
  const documentHtml = await vikeReactOnRenderHtml(pageContext);
  return {
    documentHtml: documentHtml as never,
    injectFilter(
      assets: { src: string; inject: false | "HTML_BEGIN" | "HTML_END" }[],
    ) {
      for (const asset of assets) {
        if (UNUSED_FONT_SUBSET.test(asset.src)) asset.inject = false;
      }
    },
  };
};

export { onRenderHtml };
