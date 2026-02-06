/**
 * Shared event manager for broadcasting updates to multiple SSE connections
 * Stores active controllers and sends data to all connected clients
 */

/** @type {Set<ReadableStreamController<any>>} */
const activeConnections = new Set()

/**
 * Register a new SSE connection
 * @param {ReadableStreamController<any>} controller Controller for the new connection
 * @return {() => void} Function to unregister connection after use
 */
export const registerConnection = (controller) => {
  activeConnections.add(controller)
  console.log(
    `SSE connection manager: Connection registered. Total connections: ${activeConnections.size}`,
  )
  return () => {
    activeConnections.delete(controller)
    console.log(
      `SSE connection manager: Connection unregistered. Total connections: ${activeConnections.size}`,
    )
  }
}

/**
 * Broadcast data to all connected clients
 * @param {any} data - The data to send // TODO specify type
 */
export const broadcastUpdate = (data) => {
  const eventMessage = `event: message\ndata: ${JSON.stringify(data)}\n\n`
  const encoded = new TextEncoder().encode(eventMessage)

  activeConnections.forEach((controller) => {
    try {
      controller.enqueue(encoded)
      console.log(`Broadcast to client. Message: ${eventMessage.trim()}`)
    } catch (error) {
      console.error("Error sending to client:", error)
      activeConnections.delete(controller)
    }
  })

  console.log(`Broadcast sent to ${activeConnections.size} connections`)
}
