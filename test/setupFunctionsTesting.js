import admin from "firebase-admin"
import fs from "fs-extra"

const serviceAccountPath = "service-account.json"
let serviceAccountJson, firebaseJson
try {
  serviceAccountJson = fs.readJsonSync(serviceAccountPath)
  firebaseJson = fs.readJsonSync("firebase.json")
} catch (error) {
  console.error("Error when reading JSON: ", error)
}
const port = firebaseJson.emulators.database.port
const emulatorDbUrl =
  "http://localhost:" + port + "/?ns=blind-auction-draft-default-rtdb"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountJson),
  databaseURL: emulatorDbUrl,
})
const adminDatabase = admin.database()

import functionsTest from "firebase-functions-test"

const test = functionsTest(
  {
    databaseURL: emulatorDbUrl,
  },
  serviceAccountPath
)

export default { test, adminDatabase }
