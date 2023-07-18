import { writable } from "svelte/store"
import { INPUT_BY_KEYBOARD } from "./constants"

/** @type {import("svelte/store").Writable<string>} */
export const uid = writable(null)
/** @type {import("svelte/store").Writable<import("@firebase/app").FirebaseApp>} */
export const firebaseApp = writable(null)
/** @type {import("svelte/store").Writable<number>} */
export const currentRound = writable(0)
/** @type {import("svelte/store").Writable<string>} */
export const inputMethod = writable(INPUT_BY_KEYBOARD)
