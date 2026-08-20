// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { cloudflare } from "@cloudflare/vite-plugin";
import { env } from "node:process";

export default defineConfig({
  // Cloudflare's Vite plugin owns the production SSR environment. Keeping Nitro enabled here
  // would produce a second, competing Worker adapter.
  nitro: false,
  plugins: [cloudflare({ viteEnvironment: { name: "ssr" } })],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // The Cloudflare SSR environment builds from this entrypoint.
    server: { entry: "server" },
  },
  vite: {
    server: {
      proxy: {
        "/api": {
          target: env["SPRING_API_URL"] ?? "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
  },
});
