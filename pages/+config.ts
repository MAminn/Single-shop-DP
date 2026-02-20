import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Layout from "../layouts/LayoutDefault.js";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout,

  // https://vike.dev/head-tags
  title: "Percé",
  description: "Percé — curated fashion, quiet confidence.",

  extends: vikeReact,

  // Enable pre-rendering for better performance
  // Using the new format required by Vike
  clientRouting: true,
  hydrationCanBeAborted: true,

  // Pass client session and pixel configs to the client side
  passToClient: ["clientSession", "pixelConfigs"],
} satisfies Config;
