<script>
  import { initializeApp } from "firebase/app"
  import { getDatabase, connectDatabaseEmulator } from "firebase/database"
  import { getAuth, connectAuthEmulator } from "firebase/auth"
  import { auth } from "$lib/stores"
  import firebaseJson from "../../firebase.json"
  import firebaseConfigJson from "../../firebase-config.json"
  import { onMount } from "svelte"

  onMount(function () {
    initializeApp(firebaseConfigJson)

    if (
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1"
    ) {
      connectDatabaseEmulator(
        getDatabase(),
        "localhost",
        firebaseJson.emulators.database.port
      )
      connectAuthEmulator(
        getAuth(),
        "http://localhost:" + firebaseJson.emulators.auth.port
      )
    }
    auth.set(getAuth())
  })
</script>
