<script>
  import { onAuthStateChanged } from "@firebase/auth"
  import { auth, uid } from "./stores"

  auth.subscribe((value) => {
    if (!value) return
    onAuthStateChanged($auth, userHandler)
  })

  function userHandler(user) {
    if (user) {
      uid.set(user.uid)
    } else {
      uid.set(null)
    }
  }
</script>

<p>Debugging</p>
<p>UID: {$uid}</p>
