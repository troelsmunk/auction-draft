import fs from "fs-extra"
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing"

const testEnv = await initializeTestEnvironment({
  projectId: "blind-auction-draft",
  database: {
    rules: fs.readFileSync("database.rules.json"),
    host: "localhost",
    port: fs.readJsonSync("firebase.json").emulators.database.port,
  },
})
const alice = "alice"
const aliceDb = testEnv.authenticatedContext(alice).database()

describe("a Blind Auction bidder", function () {
  beforeEach(async function () {
    await testEnv.clearDatabase()
  })

  after(async function () {
    await testEnv.clearDatabase()
  })

  it("can read the round of their auction, but not write, and not read round another auction", async function () {
    await testEnv.withSecurityRulesDisabled(async function (context) {
      await context
        .database()
        .ref("auctions/1111/seats/" + alice)
        .set(0)
    })
    const aliceAuctionRoundRef = aliceDb.ref("auctions/1111/round")
    const anotherAuctionRoundRef = aliceDb.ref("auctions/4321/round")
    await assertSucceeds(aliceAuctionRoundRef.once("value"))
    await assertFails(aliceAuctionRoundRef.set(10))
    await assertFails(anotherAuctionRoundRef.once("value"))
  })

  it("can't read or write whereever", async function () {
    const whereeverRef = aliceDb.ref("path/to/whereever")
    await assertFails(whereeverRef.once("value"))
    await assertFails(whereeverRef.set("like"))
  })
})
