<script>
  import Auth from "$lib/Auth.svelte"
  import Firebase from "$lib/Firebase.svelte"
  import { auth } from "$lib/stores"
  import { signOut } from "@firebase/auth"

  function logoutHandler() {
    //TODO: remove user index data
    return signOut($auth)
  }
</script>

<h1>Blind Auction Drafting</h1>
<button on:click={logoutHandler}>Logout</button>

<slot />

<Firebase />
<Auth />
