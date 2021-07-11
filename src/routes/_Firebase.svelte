<script>
  import { initializeApp } from "firebase/app"
  import { getDatabase } from "firebase/database"
  import { getAuth } from "firebase/auth"
  import { auth, db } from "./stores"
  import firebaseJson from "../../firebase.json"

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
