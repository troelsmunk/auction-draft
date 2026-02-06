/**
 * Shared event manager for broadcasting updates to multiple SSE (Server Sent Event) connections
 * Manages active controllers and sends data to connected clients within the same auction
 */

/** @type {Map<ReadableStreamController<any>, number>} */
const activeConnections = new Map()

/**
 * Register a new SSE connection
 * @param {ReadableStreamController<any>} controller Controller for the new connection
 * @param {number} auctionNumber The auction that the connection belongs to
 * @return {() => void} Function to unregister connection after use
 */
export const registerConnection = (controller, auctionNumber) => {
  activeConnections.set(controller, auctionNumber)
  console.log(
    `SSE connection manager: Connection registered in ${auctionNumber}. Grand total connections: ${activeConnections.size}`,
  )
  return () => {
    activeConnections.delete(controller)
    console.log(
      `SSE connection manager: Connection unregistered from ${auctionNumber}. Grand total connections: ${activeConnections.size}`,
    )
  }
}

/**
 * Broadcast data to all connected clients in that auction
 * @param {any} data - The data to send
 * @param {number} targetAuction The auction that the data should go to
 */
export const broadcastUpdate = (data, targetAuction) => {
  const eventMessage = `event: message\ndata: ${JSON.stringify(data)}\n\n`
  const encoded = new TextEncoder().encode(eventMessage)

  activeConnections.forEach((auctionNumber, controller) => {
    if (auctionNumber === targetAuction) {
      try {
        controller.enqueue(encoded)
        console.log(`Broadcast to client. Message: ${eventMessage.trim()}`)
      } catch (error) {
        console.error("Error sending to client:", error)
        activeConnections.delete(controller)
      }
    }
  })
}
