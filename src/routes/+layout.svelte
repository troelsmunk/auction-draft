<script>
  import { onMount } from "svelte"
  import Debugger from "$lib/Debugger.svelte"
  import { uid, firebaseApp } from "$lib/stores"
  import {
    getAuth,
    connectAuthEmulator,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
  } from "firebase/auth"
  import { initializeApp } from "firebase/app"
  import { getDatabase, connectDatabaseEmulator } from "firebase/database"
  import firebaseJson from "../../firebase.json"
  import firebaseConfigJson from "../../firebase-config.json"
  import Firebase from "$lib/Firebase.svelte"

  console.log("+layout <script>")

  onMount(function () {
    console.log("+layout onMount")
    onAuthStateChanged(getAuth($firebaseApp), authChangedCallback)
  })

  /** @param {import('@firebase/auth').User} user */
  async function authChangedCallback(user) {
    if (user) {
      const token = await user.getIdToken()
      const response = await fetch("/api/cookie", {
        body: JSON.stringify({ useridtoken: token }),
        method: "POST",
      })
      const uidFromResponse = await response.json()
      uid.set(uidFromResponse)
    } else {
      uid.set(null)
      // TODO call DELETE to remove the cookie
    }
  }
</script>

<h1>Blind Auction Drafting</h1>
<a href="/"> Home </a>
<button on:click={signInAnonymously(getAuth($firebaseApp))}>Login</button>
<button on:click={signOut(getAuth($firebaseApp))}>Logout</button>

<slot />

<Debugger />
<Firebase />

<style>
  ::global(*) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
</style>
