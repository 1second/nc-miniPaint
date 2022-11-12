import { defineConfig } from "vite";
import ViteRequireContext from "@originjs/vite-plugin-require-context";

export default defineConfig({
  plugins: [
    ViteRequireContext(),
  ],
  test: {
    setupFiles: [".jest/register-context.js"],
  },
});
