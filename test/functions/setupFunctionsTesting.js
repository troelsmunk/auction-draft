const admin = require("firebase-admin")
const fs = require("fs-extra")

const serviceAccountPath = "service-account.json"
const serviceAccountJson = fs.readJsonSync(serviceAccountPath)
const firebaseJson = fs.readJsonSync("firebase.json")
const port = firebaseJson.emulators.database.port
const emulatorDbUrl =
  "http://localhost:" + port + "/?ns=blind-auction-draft-default-rtdb"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountJson),
  databaseURL: emulatorDbUrl,
})
const adminDatabase = admin.database()

const functionsTest = require("firebase-functions-test")

const test = functionsTest(
  {
    databaseURL: emulatorDbUrl,
  },
  serviceAccountPath
)
module.exports = { test, adminDatabase }
