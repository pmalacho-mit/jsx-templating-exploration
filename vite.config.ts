import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "dsl",
  },
  resolve: {
    alias: {
      dsl: fileURLToPath(new URL("./dsl", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: "src/story.tsx",
      formats: ["es"],
      fileName: () => "story.mjs",
    },
    target: "es2022",
    sourcemap: true,
    rollupOptions: { external: [] },
  },
});
