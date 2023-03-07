<script>
  import { onAuthStateChanged } from "@firebase/auth"
  import { onMount } from "svelte"
  import { auth, uid } from "./stores"

  onMount(() => {
    onAuthStateChanged($auth, userCallback)
  })
  /** @param {import('@firebase/auth').User} user */
  async function userCallback(user) {
    if (user) {
      uid.set(user.uid)
      const token = await user.getIdToken()
      await fetch("/api/cookie", {
        body: JSON.stringify({ token }),
        method: "POST",
      })
    } else {
      uid.set(null)
      // TODO call DELETE to remove the cookie
    }
  }
</script>
