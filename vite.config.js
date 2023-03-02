import { searchForWorkspaceRoot } from "vite"
import { sveltekit } from "@sveltejs/kit/vite"

/** @type {import('vite').UserConfig} */
export default {
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },
}
