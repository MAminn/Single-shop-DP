import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Layout from "../layouts/LayoutDefault.js";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout,

  // https://vike.dev/head-tags
  title: "Lebsey",
  description: "Lebsey website.",

  extends: vikeReact,

  // Enable pre-rendering for better performance
  // Using the new format required by Vike
  clientRouting: true,
  hydrationCanBeAborted: true,

  // Pass client session to the client side
  passToClient: ["clientSession"],
} satisfies Config;
