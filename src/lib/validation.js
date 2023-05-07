/**
 * Validate that the data is as expected
 * @param {Object} object the object to validate
 * @param {string} description description of the object
 * @returns {boolean} true if the data is falsy, zero number or empty object
 */
export function isInvalid(object, description) {
  if (!object || object === 0 || Object.keys(object).length === 0) {
    console.error("Error BlAuDr: Invalid data. %s: %s", description, object)
    return true
  }
  return false
}
