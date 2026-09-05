import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "quantum-bunny-pwa";
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true" || process.env.GITHUB_PAGES === "true";

export default defineConfig({
  base: isGitHubPagesBuild ? `/${repositoryName}/` : "/",
  plugins: [react()],
  server: { host: "0.0.0.0", allowedHosts: true },
});
