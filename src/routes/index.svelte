<script>
  import { auth, db } from "$lib/stores"
  import { signInAnonymously } from "firebase/auth"

  db.subscribe((dbValue) => {})

  function loginHandler() {
    signInAnonymously($auth)
  }
</script>

<button on:click={loginHandler}>Login</button>

<p>Jeg kan skrive alt muligt på nettet</p>
