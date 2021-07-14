<script>
  import { initializeApp } from "firebase/app"
  import { getDatabase, useDatabaseEmulator } from "firebase/database"
  import { getAuth, useAuthEmulator } from "firebase/auth"
  import { auth, db } from "$lib/stores"
  import firebaseJson from "../../firebase.json"
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
    initialize()
  })

  export function initialize() {
    console.log("Initializing Firebase")

    initializeApp(firebaseConfig)
    db.set(getDatabase())
    auth.set(getAuth())

    if (location.hostname === "localhost") {
      console.log("Using emulators")
      useDatabaseEmulator(
        $db,
        "localhost",
        firebaseJson.emulators.database.port
      )
      useAuthEmulator($auth, "http://localhost:9099/") // Use firebaseJson
    }
  }
</script>
