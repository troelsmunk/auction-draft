<script>
  import { onDestroy, onMount } from "svelte"
  import Debugger from "$lib/Debugger.svelte"
  import { uid } from "$lib/stores"
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

  let auth
  let authUnsub

  onMount(function () {
    initializeApp(firebaseConfigJson)
    connectEmulatorsIfLocalhost()
    auth = getAuth()
    authUnsub = onAuthStateChanged(auth, userCallback)
  })
  onDestroy(authUnsub)

  function connectEmulatorsIfLocalhost() {
    if (
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1"
    ) {
      connectDatabaseEmulator(
        getDatabase(),
        "localhost",
        firebaseJson.emulators.database.port
      )
      connectAuthEmulator(
        getAuth(),
        "http://localhost:" + firebaseJson.emulators.auth.port
      )
    }
  }

  /** @param {import('@firebase/auth').User} user */
  async function userCallback(user) {
    if (user) {
      uid.set(user.uid)
      const token = await user.getIdToken()
      await fetch("/api/cookie", {
        body: JSON.stringify({ useridtoken: token }),
        method: "POST",
      })
    } else {
      uid.set(null)
      // TODO call DELETE to remove the cookie
    }
  }
</script>

<h1>Blind Auction Drafting</h1>
<a href="/"> Home </a>
<button on:click={signInAnonymously(auth)}>Login</button>
<button on:click={signOut(auth)}>Logout</button>

<slot />

<Debugger />

<style>
  ::global(*) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
</style>
