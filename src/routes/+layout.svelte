<script>
  import { onMount } from "svelte"
  import { uid, firebaseApp } from "$lib/stores"
  import { getAuth, onAuthStateChanged } from "firebase/auth"
  import Firebase from "$lib/Firebase.svelte"
  import { page } from "$app/stores"

  const pin = $page.params.pin
  const round = $page.params.round

  onMount(function () {
    onAuthStateChanged(getAuth($firebaseApp), authChangedCallback)
  })

  /** @param {import('@firebase/auth').User} user */
  async function authChangedCallback(user) {
    if (user && !$uid) {
      const token = await user.getIdToken()
      if (!token) {
        console.error(
          "Error BlAuDr: auth user: %s, ID token from user: %s",
          user,
          token
        )
      }
      const response = await fetch("/api/cookie", {
        body: JSON.stringify({ useridtoken: token }),
        method: "POST",
      })
      const uidFromResponse = await response.json()
      if (!uidFromResponse) {
        console.error(
          "Error BlAuDr: Invalid UID: %s, response from cookie API: %s",
          response,
          uidFromResponse
        )
      }
      uid.set(uidFromResponse)
    } else {
      uid.set(null)
    }
  }
</script>

<h1>Blind Auction Drafting</h1>
<p>
  <a href="/"> Home </a>
  {#if pin}
    - Auction {pin}
    {#if round}
      - Round {round}
    {/if}
  {/if}
</p>

<slot />

<Firebase />

<style>
  ::global(*) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
</style>
