import { error, fail, redirect } from "@sveltejs/kit"
import { COOKIE_NAME } from "$lib/constants"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
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
    /** @type {{"id": string} | null} } */
    const auctionSelect = await db
      .prepare("SELECT id FROM auctions WHERE auction_number = ?")
      .bind(auctionNumber)
      .first()
    const auctionId = parseInt(auctionSelect?.id || "")
    const optionsSelect = await db
      .prepare("SELECT id FROM bid_options WHERE size = ?")
      .bind(auctionSize)
      .run()
    if (optionsSelect.results.length != auctionSize) {
      return error(500, "options not found in db")
    }
    const promises = new Array()
    optionsSelect.results.forEach((optionsRow, seatIndex) => {
      const promise = db
        .prepare(
          "INSERT INTO users (auction_id, points_remaining, bid_option_id, seat_number)" +
            "VALUES (?1, ?2, ?3, ?4)",
        )
        .bind(auctionId, 1000, optionsRow.id, seatIndex)
        .run()
      promises.push(promise)
    })
    await Promise.all(promises)
    await enrollUserInAuction(event, auctionId)
    throw redirect(303, `/${auctionNumber}/1`)
  },
  join: async (event) => {
    const auctionNumber = await event.request
      .formData()
      .then((data) => data.get("auction_number"))
      .then((value) => value?.toString())
      .then((str) => parseInt(str || "0"))
    const db = event.platform?.env?.db
    if (!db) {
      return Response.json(
        { ok: false, error: "Database not available" },
        { status: 500 },
      )
    }
    /** @type {{"id": string} | null} } */
    const auctionSelect = await db
      .prepare("SELECT id FROM auctions WHERE auction_number = ?")
      .bind(auctionNumber)
      .first()
    const auctionId = parseInt(auctionSelect?.id || "")

    await enrollUserInAuction(event, auctionId)
    throw redirect(303, `/${auctionNumber}/1`)
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
 * @param {number} auctionId
 * @async
 */
async function enrollUserInAuction(event, auctionId) {
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
  const someUserSelect = await db
    .prepare("SELECT id FROM users WHERE auction_id = ? AND uid IS NULL")
    .bind(auctionId)
    .first()
  const userId = someUserSelect?.id
  await db
    .prepare("UPDATE users SET uid = ? WHERE id = ?")
    .bind(uid, userId)
    .run()
}
