import { derived, writable } from "svelte/store"

/** @type {import("svelte/store").Writable<string>} */
export const uid = writable(null)
/** @type {import("svelte/store").Writable<import("@firebase/app").FirebaseApp>} */
export const firebaseApp = writable(null)
/** @type {import("svelte/store").Writable<number>} */
export const currentRound = writable(0)
