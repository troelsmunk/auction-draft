<script>
  import Auth from "$lib/Auth.svelte"
  import Firebase from "$lib/Firebase.svelte"
  import { auth, indexPinRef, indexSizeRef, pin, uid } from "$lib/stores"
  import { signOut } from "@firebase/auth"
  import { set } from "@firebase/database"

  function logoutHandler() {
    // set($indexPinRef, null)
    // set($indexSizeRef, null)
    uid.set(null)
    return signOut($auth)
  }
</script>

<h1>Blind Auction Drafting</h1>
<button on:click={logoutHandler}>Logout</button>

<Firebase />
<Auth />
<p>UID: {$uid}</p>
<p>PIN: {$pin}</p>

<slot />
