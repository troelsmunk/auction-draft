import { error, fail, redirect } from "@sveltejs/kit"
import { COOKIE_NAME } from "$lib/constants"

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  create: async (event) => {
    const auctionSize = await event.request
      .formData()
      .then((data) => Number(data.get("auction-size")))
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
      console.error("Error: Could not connect to database.")
      return fail(500, "Database error")
    }
    /** @type { number | null}>} */
    let previousAuctionNumber = await db
      .prepare(`SELECT auction_number FROM auctions ORDER BY id DESC LIMIT 1`)
      .first("auction_number")
    const auctionNumber = generateAuctionNumber(previousAuctionNumber)
    const auctionInsert = await db
      .prepare(`INSERT INTO auctions (auction_number) VALUES (?)`)
      .bind(auctionNumber)
      .run()
    if (auctionInsert.error) {
      console.error(
        `Error: Could not insert auction into database: ${auctionInsert.error}`,
      )
      return fail(500, "Database error")
    }
    /** @type { string | null} } */
    const auctionId = await db
      .prepare(`SELECT id FROM auctions WHERE auction_number = ? LIMIT 1`)
      .bind(auctionNumber)
      .first("id")
    if (auctionId === null) {
      console.error("Error: Could not read auctionId from database.")
      return fail(500, "Database error")
    }
    /** @type {Array<Promise<D1Result>>} */
    const promises = new Array()
    for (let seatIndex = 0; seatIndex < auctionSize; seatIndex++) {
      const promise = db
        .prepare(
          `INSERT INTO users (auction_id, points_remaining, seat_number) 
          VALUES (?, ?, ?)`,
        )
        .bind(auctionId, 1000, seatIndex)
        .run()
      promises.push(promise)
    }
    const responses = await Promise.all(promises)
    const haveErrors = responses.some((response) => Boolean(response.error))
    if (haveErrors) {
      console.error(
        `Error: Could not setup user shells in database: ${responses}`,
      )
      return fail(500, "Database error")
    }
    await enrollUserInAuction(event.cookies, db, auctionId)
    throw redirect(303, `/${auctionNumber}/1`)
  },
  join: async (event) => {
    const auctionNumber = await event.request
      .formData()
      .then((data) => Number(data.get("auction_number")))
    const db = event.platform?.env?.db
    if (!db) {
      console.error("Error: Could not connect to database.")
      return fail(500, "Database error")
    }
    /** @type {string | null} } */
    const auctionId = await db
      .prepare(`SELECT id FROM auctions WHERE auction_number = ?`)
      .bind(auctionNumber)
      .first("id")
    if (auctionId === null) {
      return fail(400, {
        join: {
          auction_number: auctionNumber,
          error: "No auction with that number exists.",
        },
      })
    }
    await enrollUserInAuction(event.cookies, db, auctionId)
    throw redirect(303, `/${auctionNumber}/1`)
  },
}

/**
 * Generate an auction number based on the previous one without sequential numbers.
 * It is generated using 7 as a primitive root modulo 9001, and a  buffer of 999
 * is added to raise the number to 1000-9999, with four digits and no leading zeros.
 * @param {number|null} previousAuctionNumber number from the database, if any
 * @returns {number}
 */
function generateAuctionNumber(previousAuctionNumber) {
  if (previousAuctionNumber === null) {
    console.debug(
      `No previous auctions found in database. 
      This first auction is created using the default value.`,
    )
    previousAuctionNumber = 1999
  }
  const debufferedNumber = previousAuctionNumber - 999
  if (debufferedNumber < 1 || debufferedNumber > 9000) {
    console.error(
      `Error: Auction numbers should be four digits. 
      Somehow the previous auction had number ${previousAuctionNumber}`,
    )
    throw error(500, "Database error")
  }
  return ((debufferedNumber * 7) % 9001) + 999
}

/**
 * @param {import('@sveltejs/kit').Cookies} cookies
 * @param {import('@cloudflare/workers-types').D1Database} db
 * @param {string} auctionId
 * @async
 */
async function enrollUserInAuction(cookies, db, auctionId) {
  const previousUid = cookies.get(COOKIE_NAME)
  if (previousUid) {
    await cleanUpDataFromPreviousUid(db, previousUid)
  }
  const uid = crypto.randomUUID()
  const uidUpdate = await db
    .prepare(
      `UPDATE users SET uid = ? 
      WHERE auction_id = ? AND uid IS null 
      ORDER BY random() LIMIT 1`,
    )
    .bind(uid, auctionId)
    .run()
  if (uidUpdate.error) {
    console.error(`Error: Failed to set UID of new user: ${uidUpdate.error}`)
    return fail(500, "Database error")
  }
  cookies.set(COOKIE_NAME, uid, {
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  })
}

/**
 * @param {import('@cloudflare/workers-types').D1Database} db
 * @param {string} previousUid
 * @async
 */
async function cleanUpDataFromPreviousUid(db, previousUid) {
  const bidsDelete = await db
    .prepare(
      `DELETE FROM bids WHERE user_id IN 
      (SELECT id FROM users WHERE uid = ?)`,
    )
    .bind(previousUid)
    .run()
  if (bidsDelete.error) {
    console.error(
      `Error: Failed to delete bids for previous cookie with UID: 
      ${previousUid} with error: ${bidsDelete.error}`,
    )
  }
  const uidUpdate = await db
    .prepare(`UPDATE users SET uid = null WHERE uid = ?`)
    .bind(previousUid)
    .run()
  if (uidUpdate.error) {
    console.error(
      `Error: Failed to set UID to null for previous cookie with UID: 
      ${previousUid} with error: ${uidUpdate.error}`,
    )
  }
}
