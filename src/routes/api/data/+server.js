import { registerConnection } from "$lib/eventManager.js"

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = ({}) => {
  const stream = new ReadableStream({
    start(controller) {
      registerConnection(controller)
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
