import { defineConfig } from "unocss";

export default defineConfig({
  theme: {
    colors: {
      primary: {
        light: "#0f6cbd33",
        DEFAULT: "#0f6cbd"
      }
    },
  },
  rules: [
    ["shadow-default", {
      "box-shadow" : "0 0 2px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.14)"
    }]
  ]
});
