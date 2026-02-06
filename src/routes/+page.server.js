import { error, fail, redirect } from "@sveltejs/kit"
import { COOKIE_NAME } from "$lib/constants"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  // TODO check validity of values
  create: async (event) => {
    const auctionSize = await event.request
      .formData()
      .then((data) => data.get("auction-size"))
      .then((value) => value?.toString())
      .then((str) => parseInt(str || "0"))
    if (auctionSize < 1 || auctionSize > 6) {
      return fail(400, {
        create: {
          auctionSize: auctionSize,
          error: "The auction size should be a number between 1 and 6",
        },
      })
    }
    const db = event.platform?.env?.db
    if (!db) {
      return Response.json(
        { ok: false, error: "Database not available" },
        { status: 500 },
      )
    }
    /** @type {{"auction_number": number} | null} } */
    const previousAuctionSelect = await db
      .prepare("SELECT auction_number FROM auctions ORDER BY id DESC")
      .first()
    let previousAuctionNumber = previousAuctionSelect?.auction_number || 2000
    const auctionNumber = generateAuctionNumber(previousAuctionNumber)
    const auctionInsert = await db
      .prepare("INSERT INTO auctions (auction_number) VALUES (?)")
      .bind(auctionNumber)
      .run()
    if (auctionInsert.error) {
      console.error("Error inserting auction:", auctionInsert.error)
      return error(500, "Failed to create auction")
    }
    // TODO create bidders in db
    return enrollUserInAuction(event, auctionNumber)
  },
  join: async (event) => {
    const auctionNumber = await event.request
      .formData()
      .then((data) => data.get("auction_number"))
      .then((value) => value?.toString())
      .then((str) => parseInt(str || "0"))
    return enrollUserInAuction(event, auctionNumber)
  },
}

/** Generate auction number based on latest auction number,
 * using 7 as a primitive root modulo 9001, starting at 1000.
 * @param {number} previousAuctionNumber The previous auction number from the database
 * @returns {number} The next auction number
 */
function generateAuctionNumber(previousAuctionNumber) {
  if (previousAuctionNumber > 999) {
    let base = previousAuctionNumber - 999
    base = (base * 7) % 9001
    return base + 999
  }
  return 1000
}

/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @param {Number} auctionNumber
 * @returns
 */
async function enrollUserInAuction(event, auctionNumber) {
  const db = event.platform?.env?.db
  if (!db) {
    return Response.json(
      { ok: false, error: "Database not available" },
      { status: 500 },
    )
  }
  const uid = crypto.randomUUID()
  event.cookies.set(COOKIE_NAME, uid, {
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  })
  // TODO enroll user in auction in db
  throw redirect(303, `/${auctionNumber}/1`)
}
