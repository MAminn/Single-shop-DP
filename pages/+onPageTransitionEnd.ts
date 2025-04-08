import type { OnPageTransitionEndAsync } from "vike/types";

export const onPageTransitionEnd: OnPageTransitionEndAsync = async (
  pageContext
) => {
  document.querySelector("body")?.classList.remove("page-is-transitioning");

  // Force refresh dashboard page when navigating to it
  if (pageContext.urlPathname === "/dashboard") {
    // Small delay to ensure the page is mounted before refreshing content
    setTimeout(() => {
      window.location.reload();
    }, 20);
  }
};
