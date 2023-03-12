<script>
  import { initializeApp } from "firebase/app"
  import { getDatabase, connectDatabaseEmulator } from "firebase/database"
  import { getAuth, connectAuthEmulator } from "firebase/auth"
  import { firebaseApp } from "$lib/stores"
  import firebaseJson from "../../firebase.json"
  import firebaseConfigJson from "../../firebase-config.json"
  import { onMount } from "svelte"

  console.log("Firebase.svelte <script>")

  onMount(function () {
    console.log("Firebase.svelte onMount")
    if (!$firebaseApp) {
      firebaseApp.set(initializeApp(firebaseConfigJson))
      connectEmulatorsIfLocalhost()
    }
  })

  function connectEmulatorsIfLocalhost() {
    if (
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1"
    ) {
      connectDatabaseEmulator(
        getDatabase($firebaseApp),
        "localhost",
        firebaseJson.emulators.database.port
      )
      connectAuthEmulator(
        getAuth($firebaseApp),
        "http://localhost:" + firebaseJson.emulators.auth.port
      )
    }
  }
</script>
