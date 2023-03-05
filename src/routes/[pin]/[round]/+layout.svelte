<script>
  import Auth from "$lib/Auth.svelte"
  import Firebase from "$lib/Firebase.svelte"
  import Debugger from "$lib/Debugger.svelte"
  import { auth, pin, uid } from "$lib/stores"
  import { signOut } from "@firebase/auth"
  import Database from "$lib/Database.svelte"
  export let data
</script>

<h3>In an auction</h3>
<h3>Scoreboard</h3>
<p>There are {data.size} bidders in the auction</p>
<slot />
