import { defineConfig } from "vite";
import phaserAssetsPlugin from "./vite-plugin-phaser-asset-pack.ts";

const fullReloadAlways = {
  handleHotUpdate({ server }) {
    server.ws.send({ type: "full-reload" });
    return [];
  },
};

export default defineConfig({
  base: "./",
  plugins: [phaserAssetsPlugin(), fullReloadAlways],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
  server: {
    port: 8080,
  },
});
