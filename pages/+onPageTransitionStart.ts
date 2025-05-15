import type { OnPageTransitionStartAsync } from "vike/types";

export const onPageTransitionStart: OnPageTransitionStartAsync = async () => {
  document.querySelector("body")?.classList.add("page-is-transitioning");
  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: window.location.pathname + window.location.search,
    });
  }
};
