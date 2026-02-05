import { registerConnection } from "$lib/eventManager.js"

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = ({ request, platform }) => {
  /** @type {() => void} */
  let unregister
  /** @type {NodeJS.Timeout} */
  let keepAlive
  const { promise, resolve } = Promise.withResolvers()
  platform?.ctx?.waitUntil(promise)

  request.signal.addEventListener("abort", () => {
    console.log("Request aborted!")
    unregister?.()
    clearInterval(keepAlive)
    resolve("")
  })

  const stream = new ReadableStream({
    start(controller) {
      console.log("SSE: Client connected")
      unregister = registerConnection(controller)
      const encodedPing = new TextEncoder().encode(": ping\n")
      keepAlive = setInterval(() => {
        try {
          controller.enqueue(encodedPing)
        } catch (e) {
          console.error("SSE: Error enqueuing data:", e)
          clearInterval(keepAlive)
          unregister()
          // Attempt to close if not already closed by 'cancel'
          try {
            console.log("SSE: attempting manual close")
            controller.close()
          } catch {
            console.error("SSE: Error closing stream:", e)
          }
        }
      }, 15000)
      controller.error = () => {
        clearInterval(keepAlive)
        unregister()
      }
      controller.close = () => {
        clearInterval(keepAlive)
        unregister()
      }
    },
    cancel(reason) {
      // This is never called
      console.log(
        "SSE: Client disconnected (stream cancelled). Reason:",
        reason,
      )
      clearInterval(keepAlive)
      unregister?.()
      resolve("")
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
