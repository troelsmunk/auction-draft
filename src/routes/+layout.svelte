<script>
  import { onMount } from "svelte"
  import { uid, firebaseApp, pin, round } from "$lib/stores"
  import { getAuth, onAuthStateChanged } from "firebase/auth"
  import Firebase from "$lib/Firebase.svelte"
  import { logIfFalsy } from "$lib/validation"

  onMount(function () {
    onAuthStateChanged(getAuth($firebaseApp), authChangedCallback)
  })

  /** @param {import('@firebase/auth').User} user */
  async function authChangedCallback(user) {
    if (user && !$uid) {
      const token = await user.getIdToken()
      logIfFalsy(token, "user Firebase ID-token")
      const uidFromCookieApi = await fetch("/api/cookie", {
        body: JSON.stringify({ useridtoken: token }),
        method: "POST",
      }).then((response) => response?.json())
      logIfFalsy(uidFromCookieApi, "UID from cookie API")
      uid.set(uidFromCookieApi)
    } else {
      uid.set(null)
    }
  }
</script>

{#if $pin}
  <p>
    <a href="/"> Home </a>
    - Auction {$pin}
    {#if $round}
      - Round {$round}
    {/if}
  </p>
{:else}
  <h1>Blind Auction Drafting</h1>
{/if}

<slot />

<Firebase />

<style>
  ::global(*) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
</style>
