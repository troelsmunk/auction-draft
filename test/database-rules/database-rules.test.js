import fs from "fs-extra"
import unitTesting from "@firebase/rules-unit-testing"
const {
  assertFails,
  assertSucceeds,
  initializeAdminApp,
  initializeTestApp,
  loadDatabaseRules,
} = unitTesting

let rulesJson
try {
  rulesJson = fs.readJsonSync("database.rules.json")
} catch (error) {
  console.error("Error when reading JSON: ", error)
}
const databaseName = "blind-auction-draft-default-rtdb"
const alice = "alice"
const bob = "bob"
const bidObj = {
  0: 0,
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
  9: 1,
  10: 1,
  11: 1,
  12: 1,
  13: 1,
  14: 1,
}

const adminApp = initializeAdminApp({ databaseName: databaseName })
const adminDb = adminApp.database()

const aliceApp = initializeTestApp({
  databaseName: databaseName,
  auth: { uid: alice },
})
const aliceDb = aliceApp.database()

describe("a Blind Auction bidder", function () {
  before(async function () {
    await loadDatabaseRules({
      databaseName: databaseName,
      rules: JSON.stringify(rulesJson),
    })
  })

  beforeEach(async function () {
    await adminDb.ref().remove()
  })

  after(async function () {
    await adminDb.ref().remove()
  })

  it("can't read the size of an auction", async function () {
    const sizeRef = aliceDb.ref("auctions/pinX/size")
    await assertFails(sizeRef.once("value"))
  })
  it("can read their own seat number", async function () {
    const seatRef = aliceDb.ref("auctions/pinX/seats/" + alice)
    await assertSucceeds(seatRef.once("value"))
  })
  it("can't write a seat number, not even their own", async function () {
    const seatRef = aliceDb.ref("auctions/pinX/seats/" + alice)
    await assertFails(seatRef.set(2))
  })
  it("can't read another's seat number, even in the same auction", async function () {
    const seatRef = aliceDb.ref("auctions/pinX/seats/" + bob)
    await assertFails(seatRef.once("value"))
  })
  it("can read the scoreboard and results of their auction", async function () {
    const seatRef = adminDb.ref("auctions/pinX/seats/" + alice)
    await seatRef.set(0)

    const auctionRef = aliceDb.ref("auctions/pinX")
    const scoreboardRef = auctionRef.child("scoreboard")
    await assertSucceeds(scoreboardRef.once("value"))
    const resultsRef = auctionRef.child("results")
    await assertSucceeds(resultsRef.once("value"))
  })
  it("can't read the scoreboard or results of another auction", async function () {
    const seatRef = adminDb.ref("auctions/pinX/seats/" + alice)
    await seatRef.set(1)

    const auctionRef = aliceDb.ref("auctions/pinY")
    const scoreboardRef = auctionRef.child("scoreboard")
    await assertFails(scoreboardRef.once("value"))
    const resultsRef = auctionRef.child("results")
    await assertFails(resultsRef.once("value"))
  })
  it("can't write the size, scoreboard or results of their auction", async function () {
    const auctionRef = aliceDb.ref("auctions/pinX")
    const sizeRef = auctionRef.child("size")
    await assertFails(sizeRef.set(4))
    const scoreboardRef = auctionRef.child("scoreboard")
    await assertFails(
      scoreboardRef.set({
        0: 188,
        1: 156,
      })
    )
    const resultRef = auctionRef.child("results")
    await assertFails(
      resultRef.set({
        winners: {
          0: 2,
          1: 0,
        },
        winningBids: {
          0: 12,
          1: 3,
        },
      })
    )
  })
  it("can write their own bids, readys and index", async function () {
    const db = aliceDb
    const auctionRef = db.ref("auctions/pinX")
    const bidsRef = auctionRef.child("bids/" + alice)
    await assertSucceeds(bidsRef.set(bidObj))
    const readyRef = auctionRef.child("readys/" + alice)
    await assertSucceeds(readyRef.set(1))

    const indexRef = db.ref("index/" + alice)
    const pinRef = indexRef.child("pin")
    await assertSucceeds(pinRef.set(1))
    const sizeRef = indexRef.child("auctionSize")
    await assertSucceeds(sizeRef.set(4))
  })
  it("can't write another's bids or readys, even in the same auction", async function () {
    const auctionRef = aliceDb.ref("auctions/pinX")
    const bidsRef = auctionRef.child("bids/" + bob)
    await assertFails(bidsRef.set(bidObj))
    const readyRef = auctionRef.child("readys/" + bob)
    await assertFails(readyRef.set(true))
  })
  it("can't read their own bids or index auctionSize", async function () {
    const auctionRef = aliceDb.ref("auctions/pinX")
    const bidsRef = auctionRef.child("bids/" + alice)
    await assertFails(bidsRef.once("value"))

    const indexRef = aliceDb.ref("index/" + alice)
    const sizeRef = indexRef.child("auctionSize")
    await assertFails(sizeRef.once("value"))
  })
  it("can't read or write another's index", async function () {
    const indexRef = aliceDb.ref("index/" + bob)
    const pinRef = indexRef.child("pin")
    await assertFails(pinRef.once("value"))
    await assertFails(pinRef.set(1))
    const sizeRef = indexRef.child("auctionSize")
    await assertFails(sizeRef.once("value"))
    await assertFails(sizeRef.set(4))
  })
  it("can't input objects, text or booleans in the index pin", async function () {
    const pinRef = aliceDb.ref("index/" + alice + "/pin")
    await assertFails(pinRef.set({ 0: 1 }))
    await assertFails(pinRef.set("hej"))
    await assertFails(pinRef.set(true))
  })
  it("can't input objects, text or booleans in the index size", async function () {
    const sizeRef = aliceDb.ref("index/" + alice + "/auctionSize")
    await assertFails(sizeRef.set({ 0: 1 }))
    await assertFails(sizeRef.set("hej"))
    await assertFails(sizeRef.set(true))
  })
  it("can't input 'hej' directly under the user index", async function () {
    const indexRef = aliceDb.ref("index/" + alice)
    await assertFails(indexRef.set("hej"))
    const hejRef = indexRef.child("hej")
    await assertFails(hejRef.set(true))
  })
  it("can't input objects, text or boolean as readys", async function () {
    const readyRef = aliceDb.ref("auctions/pinX/readys/" + alice)
    await assertFails(readyRef.set({ 0: 1 }))
    await assertFails(readyRef.set("hej"))
    await assertFails(readyRef.set(false))
  })
  it("must input bid 0 through 14 as numbers", async function () {
    const readyRef = aliceDb.ref("auctions/pinX/bids/" + alice)
    await assertFails(readyRef.set(true))
    await assertFails(readyRef.set("hej"))
    await assertFails(readyRef.set(9))
    await assertFails(
      readyRef.set({
        0: "a",
        1: "b",
      })
    )
    await assertFails(
      readyRef.set({
        0: 2,
        1: 3,
      })
    )
    await assertFails(
      readyRef.set({
        0: 2,
        1: 2,
        2: 2,
        3: 2,
        4: 2,
        5: 2,
        6: 2,
        7: 2,
        8: 2,
        9: 2,
        10: 2,
        11: 2,
        12: 2,
        13: 2,
        14: 2,
        15: 2,
        16: 2,
      })
    )
    await assertFails(
      readyRef.set({
        0: 2,
        1: 2,
        2: 2,
        3: 2,
        4: 2,
        5: 2,
        6: 2,
        7: 2,
        8: 2,
        9: 2,
        10: 2,
        11: 2,
        12: 2,
        13: 2,
        14: -22,
      })
    )
  })
  it.skip("can't overwrite an existing PIN in index", async function () {
    const pinRef = aliceDb.ref(`index/${alice}/pin`)
    await assertSucceeds(pinRef.set(1234))
    await assertFails(pinRef.set(5555))
  })
  it.skip("can't overwrite an existing size in index", async function () {
    const sizeRef = aliceDb.ref(`index/${alice}/auctionSize`)
    await assertSucceeds(sizeRef.set(4))
    await assertFails(sizeRef.set(5))
  })
  it("can't read or write whereever", async function () {
    const whereeverRef = aliceDb.ref("path/to/whereever")
    await assertFails(whereeverRef.once("value"))
    await assertFails(whereeverRef.set("like"))
  })
  it.skip("can see an error message in the index", async function () {
    const errorRef = aliceDb.ref(`index/${alice}/error`)
    await assertSucceeds(errorRef.once("value"))
    await assertFails(errorRef.set(5))
  })
  it("can't read or set anothers readiness", async function () {
    const bobReadyRef = aliceDb.ref(`auctions/123/readys/bob`)
    await assertFails(bobReadyRef.set(1))
    await assertFails(bobReadyRef.once("value"))
  })
  it("can read their own readiness", async function () {
    const readyRef = aliceDb.ref(`auctions/123/readys/alice`)
    await assertSucceeds(readyRef.once("value"))
  })
  it("can delete their own user index PIN", async function () {
    const pinAddr = `index/${alice}/pin`
    const adminPinRef = adminDb.ref(pinAddr)
    await adminPinRef.set(1)
    const pinRef = aliceDb.ref(pinAddr)
    await assertSucceeds(pinRef.set(null))
  })
  it("can delete their own user index size", async function () {
    const pinAddr = `index/${alice}/auctionSize`
    const adminPinRef = adminDb.ref(pinAddr)
    await adminPinRef.set(2)
    const pinRef = aliceDb.ref(pinAddr)
    await assertSucceeds(pinRef.set(null))
  })
  it("can read their PIN from the index", async function () {
    const pinRef = aliceDb.ref(`index/${alice}/pin`)
    await assertSucceeds(pinRef.once("value"))
  })
})
