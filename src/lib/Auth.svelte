<script>
  import { onAuthStateChanged } from "@firebase/auth"
  import { auth } from "./stores"

  let uid
  auth.subscribe((value) => {
    if (!value) return
    onAuthStateChanged($auth, userHandler)
  })

  function userHandler(user) {
    if (user) {
      uid = user.uid
    } else {
      uid = null
    }
  }
</script>

<p>Debugging</p>
<p>UID: {uid}</p>
