import adapter from "@sveltejs/adapter-cloudflare"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    alias: {
      $lib: "src/lib",
      "$lib/*": "src/lib/*",
    },
    adapter: adapter(),
  },
  extends: "./.svelte-kit/tsconfig.json",
}

export default config
