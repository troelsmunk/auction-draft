/**
 * Starts the database transaction using the function at the location supplied
 * @param {import("@firebase/database-types").Reference} reference Reference where
 * the transaction should run
 * @param {(data: any) => any} transactionFunction The function that calculates
 * what to write using the data already there
 * @returns {Promise<{
 *    committed: boolean,
 *    snapshot: ?import("@firebase/database-types").DataSnapshot
 * }>} A container object for the data written at the end of the transaction
 */
module.exports = async function transaction(reference, transactionFunction) {
  return reference.transaction(
    transactionFunction, // Atomically write using the provided function,
    null, // using the snapshot returned instead of a callback,
    false // without applying partial results locally
  )
}
