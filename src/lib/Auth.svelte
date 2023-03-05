<script>
  import { onAuthStateChanged } from "@firebase/auth"
  import { onMount } from "svelte"
  import { auth, uid, userIdToken } from "./stores"

  onMount(() => {
    onAuthStateChanged($auth, userCallback)
  })
  /** @param {import('@firebase/auth').User} user */
  async function userCallback(user) {
    if (user) {
      uid.set(user.uid)
      userIdToken.set(await user.getIdToken())
    } else {
      uid.set(null)
      userIdToken.set(null)
    }
  }
</script>
