import { defineConfig } from "vite";
import assetConversionPlugin from "./vite-plugin-asset-conversion";
import assetConversionConfig from "../assets/asset-conversion.config";

export default defineConfig({
  plugins: [assetConversionPlugin(assetConversionConfig)],
  build: {
    // We don't actually want to build anything, just run the plugin
    emptyOutDir: false,
    rollupOptions: {
      input: "assets/noop.ts",
      output: {
        entryFileNames: "noop.js",
      },
      watch: {
        include: ["assets/**/*"],
      },
    },
    server: false, // Disable the development server
  },
});
