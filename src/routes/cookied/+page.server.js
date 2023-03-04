import { redirect } from "@sveltejs/kit"
import admin from "firebase-admin"

admin.initializeApp({ projectId: "blind-auction-draft" })

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  create: async (event) => {
    const formData = await event.request.formData()
    const token = formData
      .get("token") // move inline?
      .toString()
    const uid = await admin
      .auth()
      .verifyIdToken(token, false)
      .then((decodedIdToken) => {
        return decodedIdToken.uid
      })
    // create auction and get PIN
    // add user to auction
    // add pin to redirect
    throw redirect(303, "/" + uid + "/welcome")
  },
}
