import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vike from "vike/plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vike(), react(), tailwindcss()],
  build: {
    target: "es2022",
  },
  resolve: {
    alias: {
      "#root": __dirname,
    },
  },
});
