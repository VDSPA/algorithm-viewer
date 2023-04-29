import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import { presetUno } from "unocss";
import presetIcons from "@unocss/preset-icons";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    UnoCSS({
      presets: [presetUno(), presetIcons()],
    }),
  ],
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "src/components")

    }
  }
});
