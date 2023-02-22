<script>
  import { initializeApp } from "firebase/app"
  import { getDatabase, connectDatabaseEmulator } from "firebase/database"
  import { getAuth, connectAuthEmulator } from "firebase/auth"
  import { auth } from "$lib/stores"
  import firebaseJson from "../../firebase.json"
  import firebaseConfigJson from "../../firebase-config.json"
  import { onMount } from "svelte"

  let firebaseConfig = {
    apiKey: "AIzaSyBj-h-xrlpsSWg37Ptdt_wZZVmF_oB5mYw",
    authDomain: "blind-auction-draft.firebaseapp.com",
    databaseURL:
      "https://blind-auction-draft-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "blind-auction-draft",
    storageBucket: "blind-auction-draft.appspot.com",
    messagingSenderId: "246925108308",
    appId: "1:246925108308:web:200790013cfad346dff9c1",
  }

  onMount(function () {
    initializeApp(firebaseConfigJson)

    if (location.hostname === "localhost") {
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
