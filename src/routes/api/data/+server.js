import { registerConnection } from "$lib/eventManager.js"

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = ({ request, platform }) => {
  const stream = new ReadableStream({
    start(controller) {
      registerConnection(controller)
      const unregister = registerConnection(controller)
      const encodedPing = new TextEncoder().encode(": ping\n")
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encodedPing)
        } catch {
          clearInterval(keepAlive)
          unregister()
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
  })
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
