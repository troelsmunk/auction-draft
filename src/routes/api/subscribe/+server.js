import { COOKIE_NAME, ERROR_MESSAGE_401 } from "$lib/constants"
import { registerConnection } from "$lib/sseManager.js"
import { error } from "@sveltejs/kit"

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = async (event) => {
  /** @type {() => void} */
  let unregisterConnection
  /** @type {NodeJS.Timeout} */
  let keepAlive

  const uid = event.cookies.get(COOKIE_NAME)
  if (!uid) {
    throw error(401, ERROR_MESSAGE_401)
  }
  const db = event.platform?.env?.db
  if (!db) {
    console.error("Error: Could not connect to database.")
    throw error(500, "Database error")
  }
  const auctionId = await db
    .prepare(`SELECT auction_id FROM users WHERE uid = ? LIMIT 1`)
    .bind(uid)
    .first("auction_id")
  if (typeof auctionId != "number") {
    console.error("Error: Could not fetch auction_id from the database.")
    throw error(500, "Database error")
  }

  /** @type {(reason: string) => void} */
  function disconnectClient(reason) {
    console.log("SSE: Disconnecting client: ", reason)
    unregisterConnection?.()
    clearInterval(keepAlive)
  }
  event.request.signal.addEventListener("abort", () => {
    disconnectClient("Request aborted")
  })

  const stream = new ReadableStream({
    start(controller) {
      console.log("SSE: Client connected")
      unregisterConnection = registerConnection(controller, auctionId)
      const encodedPing = new TextEncoder().encode(": ping\n")
      keepAlive = setInterval(() => {
        try {
          controller.enqueue(encodedPing)
        } catch (e) {
          disconnectClient("Error enqueuing data: " + e)
          // Attempt to close if not already closed by 'cancel'
          try {
            controller.close()
          } catch (ignore) {}
        }
      }, 120000)
    },
    cancel(reason) {
      disconnectClient("Stream cancelled: " + reason)
    },
  })
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
