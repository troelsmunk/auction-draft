import firebase from "svelte-adapter-firebase"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: firebase(),
  },
  extends: "./.svelte-kit/tsconfig.json",
}

export default config
