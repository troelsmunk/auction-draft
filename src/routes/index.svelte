<script>
  import { db, auth } from "$lib/stores"
  import { ref, set, onValue } from "@firebase/database"
  import { onAuthStateChanged, signInAnonymously, signOut } from "firebase/auth"

  let talRef
  let talFraDb = 0
  db.subscribe((value) => {
    console.log("db subscribed: ", value)
    if (!value) return
    talRef = ref(value, "tal")
    onValue(talRef, (snap) => {
      talFraDb = snap.val()
    })
  })
  /** @type {number} */
  let tal = 0
  function setTal() {
    return set(talRef, tal)
  }

  function loginHandler() {
    return signInAnonymously($auth)
  }
  function logoutHandler() {
    //TODO: remove user index data
    return signOut($auth)
  }

  let uid
  auth.subscribe((value) => {
    if (!value) return
    onAuthStateChanged($auth, (user) => {
      if (user) {
        uid = user.uid
      } else {
        uid = null
      }
    })
  })
</script>

<button on:click={loginHandler}>Login</button>
<button on:click={logoutHandler}>Logout</button>
<p>UID: {uid}</p>

<p>Jeg kan skrive alt muligt på nettet</p>
<form on:submit|preventDefault={setTal}>
  <input bind:value={tal} type="number" />
  <input type="submit" />
</form>

<p>
  Her er et tal fra databasen: {talFraDb}
</p>
