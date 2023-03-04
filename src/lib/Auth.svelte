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
      await user.getIdToken()
    } else {
      uid.set(null)
    }
  }
</script>
