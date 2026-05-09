import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      include: /\.(js|jsx|ts|tsx)$/,
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.js$/,
  },
});