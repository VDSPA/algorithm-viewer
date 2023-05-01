import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import { presetUno } from "unocss";
import presetIcons from "@unocss/preset-icons";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      UnoCSS({
        presets: [presetUno(), presetIcons()],
      }),
    ],
    resolve: {
      alias: {
        "@/components": path.resolve(__dirname, "src/components"),
        "@/services": path.resolve(__dirname, "src/services"),
        "@/hooks": path.resolve(__dirname, "src/hooks"),
        "@/utils": path.resolve(__dirname, "src/utils")
      }
    },
    server: {
      proxy: {
        "/api": env.HOST
      }
    }
  };
});

