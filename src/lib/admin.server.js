import admin from "firebase-admin"
admin.initializeApp()

/**
 * Checks the idToken against the admin.auth service
 * @param {any} userIdToken The idToken sent alongside the form input from the user
 * @returns {Promise<string>} The UID of the validated user
 */
function validateUserAndGetUid(userIdToken) {
  return admin
    .auth()
    .verifyIdToken(userIdToken, false)
    .then((decodedIdToken) => {
      return decodedIdToken.uid
    })
}
export { admin, validateUserAndGetUid }
