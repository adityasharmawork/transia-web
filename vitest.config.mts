import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Security/regression suite. Run with: pnpm test
// (requires `vitest` as a devDependency — see package.json).
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
    testTimeout: 30000,
    pool: "forks",
    fileParallelism: false,
  },
});
