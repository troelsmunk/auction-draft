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
      console.error("Error: Could not connect to database.")
      return error(500, "Database error")
    }
    /** @type { number | null}>} */
    let previousAuctionNumber = await db
      .prepare("SELECT auction_number FROM auctions ORDER BY id DESC LIMIT 1")
      .first("auction_number")
    if (previousAuctionNumber === null) {
      console.debug(
        "No previous auctions found. Creating first auction using default value.",
        "Should only happen once.",
      )
      previousAuctionNumber = previousAuctionNumber || 2000
    }
    const auctionNumber = generateAuctionNumber(previousAuctionNumber)
    const auctionInsert = await db
      .prepare("INSERT INTO auctions (auction_number) VALUES (?)")
      .bind(auctionNumber)
      .run()
    if (auctionInsert.error) {
      console.error(
        "Error: Could not insert auction into database: ",
        auctionInsert.error,
      )
      return error(500, "Database error")
    }
    /** @type { string | null} } */
    const auctionId = await db
      .prepare("SELECT id FROM auctions WHERE auction_number = ? LIMIT 1")
      .bind(auctionNumber)
      .first("id")
    if (auctionId === null) {
      console.error("Error: Could not read auctionId from database.")
      return error(500, "Database error")
    }

    /** @type {Array<Promise<D1Result<Record<string, unknown>>>>} */
    const promises = new Array()
    for (let seatIndex = 0; seatIndex < auctionSize; seatIndex++) {
      const promise = db
        .prepare(
          "INSERT INTO users (auction_id, points_remaining, seat_number)" +
            "VALUES (?, ?, ?)",
        )
        .bind(auctionId, 1000, seatIndex)
        .run()
      promises.push(promise)
    }
    const responses = await Promise.all(promises)
    const errors = responses.filter((response) => {
      return response.error
    })
    if (errors.length > 0) {
      console.error(
        "Error: Could not setup user shells in database: ",
        errors.flatMap((value) => value.error).join(),
      )
      return error(500, "Database error")
    }
    await enrollUserInAuction(event.cookies, db, auctionId)
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
      console.error("Error: Could not connect to database.")
      return error(500, "Database error")
    }
    /** @type {string | null} } */
    const auctionId = await db
      .prepare("SELECT id FROM auctions WHERE auction_number = ?")
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
      "UPDATE users SET uid = ? WHERE auction_id = ? AND uid IS null LIMIT 1",
    )
    .bind(uid, auctionId)
    .run()
  if (uidUpdate.error) {
    console.error("Error: Failed to set UID of new user: ", uidUpdate.error)
    return error(500, "Database error")
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
      "DELETE FROM bids WHERE user_id IN " +
        "(SELECT id FROM users WHERE uid = ?)",
    )
    .bind(previousUid)
    .run()
  if (bidsDelete.error) {
    console.error(
      "Error: Failed to delete bids for previous cookie with UID: ",
      previousUid,
      " with error: ",
      bidsDelete.error,
    )
  }
  const uidUpdate = await db
    .prepare("UPDATE users SET uid = null WHERE uid = ?")
    .bind(previousUid)
    .run()
  if (uidUpdate.error) {
    console.error(
      "Error: Failed to set UID to null for previous cookie with UID: ",
      previousUid,
      " with error: ",
      uidUpdate.error,
    )
  }
}
