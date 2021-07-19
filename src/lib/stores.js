import { derived, writable } from "svelte/store"

/** @type {import("svelte/store").Writable<import("firebase/database").FirebaseDatabase> */
export const db = writable(null)
/** @type {import("svelte/store").Writable<import("firebase/auth").Auth> */
export const auth = writable(null)
/** @type {import("svelte/store").Readable<Boolean> */
export const appLoaded =
  derived <
  Boolean >
  ([db, auth],
  ([$db, $auth]) => {
    return $db && $auth
  })
/** @type {import("svelte/store").Writable<string> */
export const uid = writable(null)
