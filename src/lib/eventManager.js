/**
 * Shared event manager for broadcasting updates to multiple SSE connections
 * Stores active controllers and sends data to all connected clients
 */

/** @type {Set<ReadableStreamController<any>>} */
const activeConnections = new Set()

/**
 * Register a new SSE connection
 * @param {ReadableStreamController<any>} controller
 */
export const registerConnection = (controller) => {
  activeConnections.add(controller)
  console.log(
    `New connection registered. Total connections: ${activeConnections.size}`,
  )
  return () => {
    activeConnections.delete(controller)
    console.log(
      `Connection unregistered. Total connections: ${activeConnections.size}`,
    )
  }
}

/**
 * Broadcast data to all connected clients
 * @param {any} data - The data to send // TODO specify type
 * @param {string} eventType - The event type (default: 'update') // TODO remove
 */
export const broadcastUpdate = (data, eventType = "update") => {
  const eventMessage = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`
  const encoded = new TextEncoder().encode(eventMessage)

  /** @type {Array<ReadableStreamController<any>>} */
  let failedConnections = []

  activeConnections.forEach((controller) => {
    try {
      controller.enqueue(encoded)
      console.log(`Broadcast to client. Message: ${eventMessage.trim()}`)
    } catch (error) {
      console.error("Error sending to client:", error)
      failedConnections.push(controller) // TODO move activeConnections.delete(controller) here
    }
  })

  // Remove failed connections
  failedConnections.forEach((controller) => {
    activeConnections.delete(controller)
  })

  console.log(`Broadcast sent to ${activeConnections.size} connections`)
  return activeConnections.size // TODO remove
}
