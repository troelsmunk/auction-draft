import { validateUserAndGetUid } from "$lib/admin.server"
import { json } from "@sveltejs/kit"
import { COOKIE_NAME } from "$lib/constants"
import { isInvalid } from "$lib/validation"

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST(event) {
  const requestBody = await event.request.json()
  if (isInvalid(requestBody, "cookie requestBody")) return
  const useridtoken = requestBody.useridtoken
  if (isInvalid(useridtoken, "useridtoken from request")) return
  const uid = await validateUserAndGetUid(useridtoken)
  event.cookies.set(COOKIE_NAME, uid, {
    path: "/",
    maxAge: 60 * 60 * 24 * 2, // say, 2 days
  })
  return json(uid)
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export function DELETE() {
  // do something
}
