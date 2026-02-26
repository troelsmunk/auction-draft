/**
 * Shared event manager for broadcasting updates to multiple SSE (Server Sent Event) connections
 * Manages active controllers and sends data to connected clients within the same auction
 */

/** @type {Map<ReadableStreamController<any>, number>} */
const activeConnections = new Map()

/**
 * Register a new SSE connection
 * @param {ReadableStreamController<any>} controller Controller for the new connection
 * @param {number} auctionId Id of the auction that the connection belongs to
 * @return {() => void} Function to unregister connection after use
 */
export const registerConnection = (controller, auctionId) => {
  activeConnections.set(controller, auctionId)
  console.log(
    `SSE connection registered in id ${auctionId}. Grand total connections: ${activeConnections.size}`,
  )
  return () => {
    activeConnections.delete(controller)
    console.log(
      `SSE connection unregistered from id ${auctionId}. Grand total connections: ${activeConnections.size}`,
    )
  }
}

/**
 * Broadcast data to all connected clients in that auction
 * @param {Object} data - The data to send
 * @param {number} targetAuction The auction id that the data should go to
 */
export const broadcastUpdate = (data, targetAuction) => {
  const eventMessage = `event: message\ndata: ${JSON.stringify(data)}\n\n`
  const encoded = new TextEncoder().encode(eventMessage)

  activeConnections.forEach((auctionId, controller) => {
    if (auctionId === targetAuction) {
      try {
        controller.enqueue(encoded)
      } catch (error) {
        console.error("Error sending to client:", error)
        activeConnections.delete(controller)
      }
    }
  })
}
