import admin from "firebase-admin"
import fs from "fs-extra"

const projectPath = "/Users/troelsmunk/Projects/auction-draft/"
const serviceAccountPath = projectPath + "service-account.json"
//trycatch
const serviceAccount = fs.readJsonSync(serviceAccountPath)
const firebaseJson = fs.readJsonSync(projectPath + "firebase.json")
const port = firebaseJson.emulators.database.port
const emulatorDbUrl =
  "http://localhost:" + port + "/?ns=blind-auction-draft-default-rtdb"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
