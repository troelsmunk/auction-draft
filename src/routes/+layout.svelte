<script>
  import { onMount } from "svelte"
  import { uid, firebaseApp } from "$lib/stores"
  import {
    getAuth,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
  } from "firebase/auth"
  import Firebase from "$lib/Firebase.svelte"
  import { page } from "$app/stores"

  onMount(function () {
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
    }
  }

  function signIn() {
    return signOut(getAuth($firebaseApp)).then(() =>
      signInAnonymously(getAuth($firebaseApp))
    )
  }
</script>

<h1>Blind Auction Drafting</h1>
<p>
  <a href="/"> Home </a>
  {#if $page.params.pin}
    - Auction {$page.params.pin}
  {/if}
  {#if $page.params.round}
    - Round {$page.params.round}
  {/if}
</p>

{#if !$uid}
  <h3>Do you like cookies?</h3>
  <button on:click={signIn}>Cookies!</button>
{/if}

<slot />

<Firebase />

<style>
  ::global(*) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
</style>
