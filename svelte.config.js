import adapter from "@sveltejs/adapter-auto"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
  },
  extends: "./.svelte-kit/tsconfig.json",
}

export default config
