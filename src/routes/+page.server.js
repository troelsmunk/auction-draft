import { redirect } from "@sveltejs/kit"
import admin from "firebase-admin"

admin.initializeApp({ projectId: "blind-auction-draft" })

/** @type {import('@sveltejs/kit').Actions} */
export const actions = {
  token: async (event) => {
    const formData = await event.request.formData()
    console.log("formData: " + formData)
    const token = formData.get("token").toString()
    console.log("token: " + token)

    const uid = await admin
      .auth()
      .verifyIdToken(token, false)
      .then((decodedIdToken) => {
        return decodedIdToken.uid
      })
      .catch((error) => {
        console.log(error)
      })
    throw redirect(303, "/logged-in")
    return { success: true, uid: uid }
  },
  register: async (event) => {
    database.setIndexSize(parseInt(event.numberOfBidders))
    database.listenForPin()
  },
}
