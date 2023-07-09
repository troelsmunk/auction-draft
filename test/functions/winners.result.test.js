const assert = require("assert/strict")
const { adminDatabase } = require("./setupFunctionsTesting.js")
const {
  initFakeAuction,
  setDataAndCallWrappedFunction,
  signUpFakeBidders,
  setBid,
  setScore,
} = require("./winners.data-generator")
const alice = "alice"
const bob = "bob"
const carl = "carl"

describe("The function determining the auction winners", function () {
  describe("triggered by a change to readiness", function () {
    describe("where everyone is ready with actual bids", function () {
      it("chooses the high bid and the corresponding bidder", async function () {
        const pin = 1255
        const size = 2
        const round = 10
        const card = 0
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const fourteenZeroes = Array(14).fill(0)
        let aliceBid = [3].concat(fourteenZeroes)
        let bobBid = [1].concat(fourteenZeroes)
        const expectedWinningBid = aliceBid[card]
        await setBid(pin, alice, aliceBid)
        await setBid(pin, bob, bobBid)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const resultRef = adminDatabase.ref(
          `auctions/${pin}/results/rounds/${round}/${card}`
        )
        const actualWinnerSeat = await resultRef
          .child(`seat`)
          .get()
          .then((snap) => snap.val())
        const actualBid = await resultRef
          .child(`bid`)
          .get()
          .then((snap) => snap.val())
        const aliceSeat = 0
        assert.equal(
          actualWinnerSeat,
          aliceSeat,
          `The winner for card ${card} should be ${aliceSeat}, but was ${actualWinnerSeat}`
        )
        assert.equal(
          actualBid,
          expectedWinningBid,
          `The winning bid for card ${card} should be ${expectedWinningBid}, but was ${actualBid}`
        )
      })
      it("can choose high bids and bidders for different cards", async function () {
        const pin = 1256
        const size = 2
        const round = 13
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const thirteenZeroes = Array(13).fill(0)
        let aliceBid = [3, 12].concat(thirteenZeroes)
        let bobBid = [13, 8].concat(thirteenZeroes)
        const firstCard = 0
        const firstWinningBid = bobBid[firstCard]
        const bobSeat = 1
        const secondCard = 1
        const secondWinningBid = aliceBid[secondCard]
        const aliceSeat = 0
        await setBid(pin, alice, aliceBid)
        await setBid(pin, bob, bobBid)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const result = await adminDatabase
          .ref(`auctions/${pin}/results/rounds/${round}`)
          .get()
          .then((snap) => snap.val())
        const resultForFirstCard = result[firstCard]
        const resultForSecondCard = result[secondCard]
        const actualWinningBidForFirstCard = resultForFirstCard["bid"]
        const actualWinnerOfFirstCard = resultForFirstCard["seat"]
        const actualWinningBidForSecondCard = resultForSecondCard["bid"]
        const actualWinnerOfSecondCard = resultForSecondCard["seat"]
        assert.equal(
          actualWinnerOfFirstCard,
          bobSeat,
          `The winner for card ${firstCard} should be ${bobSeat}, but was ${actualWinnerOfFirstCard}`
        )
        assert.equal(
          actualWinningBidForFirstCard,
          firstWinningBid,
          `The winning bid for card ${firstCard} should be ${firstWinningBid}, but was ${actualWinningBidForFirstCard}`
        )
        assert.equal(
          actualWinnerOfSecondCard,
          aliceSeat,
          `The winner for card ${secondCard} should be ${aliceSeat}, but was ${actualWinnerOfSecondCard}`
        )
        assert.equal(
          actualWinningBidForSecondCard,
          secondWinningBid,
          `The winning bid for card ${secondCard} should be ${secondWinningBid}, but was ${actualWinningBidForSecondCard}`
        )
      })
      it("can choose different winners for different rounds", async function () {
        const pin = 1257
        const size = 2
        const round = 13
        const nextRound = 14
        const firstCard = 0
        const aliceSeat = 0
        const bobSeat = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const fourteenZeroes = Array(14).fill(0)
        let aliceBid = [4].concat(fourteenZeroes)
        let bobBid = [2].concat(fourteenZeroes)
        const firstRoundWinningBid = aliceBid[firstCard]
        await setBid(pin, alice, aliceBid)
        await setBid(pin, bob, bobBid)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        aliceBid = [3].concat(fourteenZeroes)
        bobBid = [5].concat(fourteenZeroes)
        const nextRoundWinningBid = bobBid[firstCard]
        await setBid(pin, alice, aliceBid)
        await setBid(pin, bob, bobBid)
        const everyoneReadyForNextRound = { alice: nextRound, bob: nextRound }
        await setDataAndCallWrappedFunction(pin, everyoneReadyForNextRound)

        const resultFirstRound = await adminDatabase
          .ref(`auctions/${pin}/results/rounds/${round}/${firstCard}`)
          .get()
          .then((snap) => snap.val())
        const actualWinningBidFirstRound = resultFirstRound["bid"]
        const actualWinnerFirstRound = resultFirstRound["seat"]
        const resultNextRound = await adminDatabase
          .ref(`auctions/${pin}/results/rounds/${nextRound}/${firstCard}`)
          .get()
          .then((snap) => snap.val())
        const actualWinningBidNextRound = resultNextRound["bid"]
        const actualWinnerNextRound = resultNextRound["seat"]

        assert.equal(
          actualWinnerFirstRound,
          aliceSeat,
          `The winner in round ${round} should be ${aliceSeat}, but was ${actualWinnerFirstRound}`
        )
        assert.equal(
          actualWinningBidFirstRound,
          firstRoundWinningBid,
          `The winning bid in round ${round} should be ${firstRoundWinningBid}, but was ${actualWinningBidFirstRound}`
        )
        assert.equal(
          actualWinnerNextRound,
          bobSeat,
          `The winner in round ${nextRound} should be ${bobSeat}, but was ${actualWinnerNextRound}`
        )
        assert.equal(
          actualWinningBidNextRound,
          nextRoundWinningBid,
          `The winning bid in round ${nextRound} should be ${nextRoundWinningBid}, but was ${actualWinningBidNextRound}`
        )
      })
      it("chooses the richest bidder if the bids are tied", async function () {
        const pin = 1258
        const size = 2
        const round = 4
        const card = 0
        const aliceSeat = 0
        const bobSeat = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        await setScore(pin, bobSeat, 190)
        const fourteenZeroes = Array(14).fill(0)
        let aliceBid = [21].concat(fourteenZeroes)
        let bobBid = [21].concat(fourteenZeroes)
        const expectedWinningBid = aliceBid[card]
        await setBid(pin, alice, aliceBid)
        await setBid(pin, bob, bobBid)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const result = await adminDatabase
          .ref(`auctions/${pin}/results/rounds/${round}/${card}`)
          .get()
          .then((snap) => snap.val())
        const actualWinnerSeat = result["seat"]
        const actualBid = result["bid"]
        assert.equal(
          actualWinnerSeat,
          aliceSeat,
          `The winner for card ${card} should be ${aliceSeat}, but was ${actualWinnerSeat}`
        )
        assert.equal(
          actualBid,
          expectedWinningBid,
          `The winning bid for card ${card} should be ${expectedWinningBid}, but was ${actualBid}`
        )
      })
      it("chooses the richest bidder only among the tied bidders", async function () {
        const pin = 1259
        const size = 3
        const round = 7
        const card = 0
        const aliceSeat = 0
        const bobSeat = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob, carl)
        await setScore(pin, aliceSeat, 190)
        await setScore(pin, bobSeat, 180)
        const fourteenZeroes = Array(14).fill(0)
        let aliceBid = [15].concat(fourteenZeroes)
        let bobBid = [15].concat(fourteenZeroes)
        let carlBid = [2].concat(fourteenZeroes)
        const expectedWinningBid = aliceBid[card]
        await setBid(pin, alice, aliceBid)
        await setBid(pin, bob, bobBid)
        await setBid(pin, carl, carlBid)
        const everyoneReady = { alice: round, bob: round, carl: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const result = await adminDatabase
          .ref(`auctions/${pin}/results/rounds/${round}/${card}`)
          .get()
          .then((snap) => snap.val())
        const actualWinnerSeat = result["seat"]
        const actualBid = result["bid"]
        assert.equal(
          actualWinnerSeat,
          aliceSeat,
          `The winner for card ${card} should be ${aliceSeat}, but was ${actualWinnerSeat}`
        )
        assert.equal(
          actualBid,
          expectedWinningBid,
          `The winning bid for card ${card} should be ${expectedWinningBid}, but was ${actualBid}`
        )
      })
      it("doesn't choose one of the non-richest bidders among the tied bidders", async function () {
        const pin = 1260
        const size = 3
        const round = 4
        const card = 0
        const aliceSeat = 0
        const bobSeat = 1
        const carlSeat = 2
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob, carl)
        await setScore(pin, aliceSeat, 170)
        await setScore(pin, bobSeat, 180)
        await setScore(pin, carlSeat, 180)
        const fourteenZeroes = Array(14).fill(0)
        let bobBid = [15].concat(fourteenZeroes)
        let aliceBid = [15].concat(fourteenZeroes)
        let carlBid = [15].concat(fourteenZeroes)
        await setBid(pin, alice, aliceBid)
        await setBid(pin, bob, bobBid)
        await setBid(pin, carl, carlBid)
        const everyoneReady = { alice: round, bob: round, carl: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const actualWinnerSeat = await adminDatabase
          .ref(`auctions/${pin}/results/rounds/${round}/${card}/seat`)
          .get()
          .then((snap) => snap.val())
        assert.notEqual(
          actualWinnerSeat,
          aliceSeat,
          `The winner for card ${card} should not be ${aliceSeat}, but it was: ${actualWinnerSeat}`
        )
      })
      it("chooses the highest priority if bids and wealth are tied")
      it("chooses the highest priority only among the richest, tied bidders")
      it("subtracts a winning bid from the score", async function () {
        const pin = 1261
        const size = 2
        const round = 11
        const card = 0
        const aliceSeat = 0
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        const fourteenZeroes = Array(14).fill(0)
        let aliceBid = [23].concat(fourteenZeroes)
        const expectedScore = 200 - aliceBid[card]
        await setBid(pin, alice, aliceBid)
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const result = await adminDatabase
          .ref(`auctions/${pin}/scoreboard/${aliceSeat}`)
          .get()
          .then((snap) => snap.val())
        assert.equal(
          result,
          expectedScore,
          `Alice should have ${expectedScore} left on the scoreboard, but there was ${result}`
        )
      })
      it("subtracts winning bids from the score", async function () {
        const pin = 1262
        const size = 2
        const round = 1
        const firstCard = 0
        const secondCard = 1
        const thirdCard = 2
        const aliceSeat = 0
        const bobSeat = 1
        await initFakeAuction(pin, size, round)
        await signUpFakeBidders(pin, alice, bob)
        await setScore(pin, bobSeat, 197)
        const twelveZeroes = Array(12).fill(0)
        let aliceBid = [2, 14, 10].concat(twelveZeroes)
        let bobBid = [1, 18, 1].concat(twelveZeroes)
        await setBid(pin, alice, aliceBid)
        await setBid(pin, bob, bobBid)
        const expectedAliceScore =
          200 - aliceBid[firstCard] - aliceBid[thirdCard]
        const expectedBobScore = 197 - bobBid[secondCard]
        const everyoneReady = { alice: round, bob: round }
        await setDataAndCallWrappedFunction(pin, everyoneReady)
        const scoreboardRef = adminDatabase.ref(`auctions/${pin}/scoreboard/`)
        const actualAliceScore = await scoreboardRef
          .child(`${aliceSeat}`)
          .get()
          .then((snap) => snap.val())
        const actualBobScore = await scoreboardRef
          .child(`${bobSeat}`)
          .get()
          .then((snap) => snap.val())
        assert.equal(
          actualAliceScore,
          expectedAliceScore,
          `Alice should have ${expectedAliceScore} left on the scoreboard, but there was ${actualAliceScore}`
        )
        assert.equal(
          actualBobScore,
          expectedBobScore,
          `Bob should have ${expectedBobScore} left on the scoreboard, but there was ${actualBobScore}`
        )
      })
    })
  })
})
