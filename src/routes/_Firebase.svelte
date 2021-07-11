<script>
  import { initializeApp } from "firebase/app"
  import { getDatabase } from "firebase/database"
  import { getAuth } from "firebase/auth"
  import { auth, db } from "./stores"
  import firebaseJson from "../../firebase.json"

  let firebaseConfig

  export function initialize() {
    console.log("Initializing Firebase")

    initializeApp(firebaseConfig)
    db.set(getDatabase())
    auth.set(getAuth())

    if (location.hostname === "localhost") {
      $db.useEmulator("localhost", firebaseJson.emulators.database.port)
      $auth.useEmulator("http://localhost:9099/") // Use firebaseJson
    }
  }
</script>
