import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

console.log(new URL("./src/config", import.meta.url).pathname);

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
      "@config/": new URL("./src/config", import.meta.url).pathname,
    },
    globals: true,
  },
});
