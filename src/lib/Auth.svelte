<script>
  import { onAuthStateChanged } from "@firebase/auth"
  import { onMount } from "svelte"
  import { auth, uid } from "./stores"

  onMount(() => {
    onAuthStateChanged($auth, userCallback)
  })
  function userCallback(user) {
    if (user) {
      uid.set(user.uid)
    } else {
      uid.set(null)
    }
  }
</script>
