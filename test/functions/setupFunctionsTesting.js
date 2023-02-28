const admin = require("firebase-admin")
const fs = require("fs-extra")

const serviceAccountJson = fs.readJsonSync("service-account.json")
const firebaseJson = fs.readJsonSync("firebase.json")
const port = firebaseJson.emulators.database.port
const emulatorDbUrl =
  "http://localhost:" + port + "/?ns=blind-auction-draft-default-rtdb"
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountJson),
  databaseURL: emulatorDbUrl,
})

const test = require("firebase-functions-test")(
  {
    databaseURL: emulatorDbUrl,
  },
  "service-account.json"
)
const adminDatabase = admin.database()
module.exports = { test, adminDatabase }
