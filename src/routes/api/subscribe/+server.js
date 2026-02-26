import { COOKIE_NAME } from "$lib/constants"
import { registerConnection } from "$lib/sseManager.js"
import { error } from "@sveltejs/kit"

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = async ({ cookies, params, request, platform }) => {
  /** @type {() => void} */
  let unregisterConnection
  /** @type {NodeJS.Timeout} */
  let keepAlive

  const uid = cookies.get(COOKIE_NAME)
  if (!uid) {
    throw error(401, "Please log in")
  }
  const db = platform?.env?.db
  if (!db) {
    console.error("Error: Could not connect to database.")
    return error(500, "Database error")
  }
  /** @type {number|null} */
  const auctionId = await db
    .prepare(`SELECT auction_id FROM users WHERE uid = ? LIMIT 1`)
    .bind(uid)
    .first("auction_id")
  if (!auctionId) {
    console.error("Error: Could not fetch auction_id from the database.")
    return error(500, "Database error")
  }

  // Keep the worker alive until the connection is closed
  const { promise, resolve } = Promise.withResolvers()
  platform?.ctx?.waitUntil(promise)

  /** @type {(reason: string) => void} */
  function disconnectClient(reason) {
    console.log("SSE: Disconnecting client: ", reason)
    unregisterConnection?.()
    clearInterval(keepAlive)
    resolve(reason)
  }
  request.signal.addEventListener("abort", () => {
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
