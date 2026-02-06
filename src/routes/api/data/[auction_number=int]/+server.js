import { registerConnection } from "$lib/sseManager.js"

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = ({ params, request, platform }) => {
  /** @type {() => void} */
  let unregisterConnection
  /** @type {NodeJS.Timeout} */
  let keepAlive
  /** @type{number} TODO get this from db via uid from cookie */
  const auctionNumber = parseInt(params.auction_number)

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
      unregisterConnection = registerConnection(controller, auctionNumber)
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
      }, 15000)
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
