import { FirebaseDatabase, ref } from "@firebase/database"
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
/** @type {import("svelte/store").Writable<number> */
export const pin = writable(null)

export const indexPinRef =
  derived <
  FirebaseDatabase >
  ([db, uid],
  ($db, $uid) => {
    if (!$db || !$uid) return null
    else return ref($db, `index/${$uid}/pin`)
  })

export const indexSizeRef =
  derived <
  FirebaseDatabase >
  ([db, uid],
  ($db, $uid) => {
    if (!$db || !$uid) return null
    else return ref($db, `index/${$uid}/auctionSize`)
  })
