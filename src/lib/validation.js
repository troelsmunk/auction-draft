/**
 * Check if the data is falsy and write to log if so
 * @param {Object} object the object to validate
 * @param {string} description description of the object
 * @returns {boolean} true if the data is falsy
 */
export function logIfFalsy(object, description) {
  if (!object) {
    console.error("Error BlAuDr: Invalid data. %s: ", description)
    console.error(object)
    return true
  }
  return false
}
