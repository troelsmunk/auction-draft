<script>
  import Auth from "$lib/Auth.svelte"
  import Firebase from "$lib/Firebase.svelte"
  import Debugger from "$lib/Debugger.svelte"
  import { auth, pin, uid } from "$lib/stores"
  import Database from "$lib/Database.svelte"
</script>

<h1>Blind Auction Drafting</h1>

<Firebase />
<Auth />
<slot />

<a href="/"> Home </a>

<Debugger />

<style>
  ::global(*) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }
</style>
