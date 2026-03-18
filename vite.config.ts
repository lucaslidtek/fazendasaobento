import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@workspace/api-zod": path.resolve(import.meta.dirname, "src", "lib", "api-zod"),
      "@workspace/api-client-react": path.resolve(import.meta.dirname, "src", "lib", "api-client-react"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
