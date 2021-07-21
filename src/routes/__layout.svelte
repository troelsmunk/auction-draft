<script>
  import Auth from "$lib/Auth.svelte"
  import Firebase from "$lib/Firebase.svelte"
  import { auth, pin, uid } from "$lib/stores"
  import { signOut } from "@firebase/auth"
  import Database from "$lib/Database.svelte"

  let database
  function logoutHandler() {
    database.clearIndex()
    uid.set(null)
    pin.set(null)
    return signOut($auth)
  }
</script>

<h1>Blind Auction Drafting</h1>

<Firebase />
<Auth />
{#if $uid}
  <button on:click={logoutHandler}>Logout</button>
  <Database bind:this={database} uid={$uid} />
{/if}
<p>UID: {$uid}</p>
<p>PIN: {$pin}</p>

<slot />
