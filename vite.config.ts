import { defineConfig } from "vite";
import path from "path";

const rawPort = process.env.PORT || "5173";
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:   path.resolve(import.meta.dirname, "index.html"),
        plain:  path.resolve(import.meta.dirname, "plain.html"),
        matrix: path.resolve(import.meta.dirname, "matrix.html"),
        xp:     path.resolve(import.meta.dirname, "xp.html"),
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    rewrites: [
      { from: /^\/plain\/?$/, to: "/plain.html" },
      { from: /^\/matrix\/?$/, to: "/matrix.html" },
      { from: /^\/xp\/?$/, to: "/xp.html" },
    ],
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
