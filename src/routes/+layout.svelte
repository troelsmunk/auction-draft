<script>
  import Auth from "$lib/Auth.svelte"
  import Firebase from "$lib/Firebase.svelte"
  import Debugger from "$lib/Debugger.svelte"
  import { auth, pin, uid } from "$lib/stores"
  import { signOut } from "@firebase/auth"
  import Database from "$lib/Database.svelte"

  let database
  function logoutHandler() {
    database.clearIndex()
    pin.set(null)
    return signOut($auth)
  }
</script>

<h1>Blind Auction Drafting</h1>

<Firebase />
<Auth />
<slot />

<a href="/"> Home </a>
{#if $uid}
  <button on:click={logoutHandler}>Logout</button>
  <Database bind:this={database} uid={$uid} />
{/if}

<Debugger />

<style>
  ::global(*) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
</style>
