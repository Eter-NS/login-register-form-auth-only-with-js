import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";

export default defineConfig({
  root: "./src",
  build: {
    emptyOutDir: true,
    outDir: "../dist",
  },
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
});
