import { validateUserAndGetUid } from "$lib/admin.server"

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST(event) {
  const requestBody = await event.request.json()
  const uid = await validateUserAndGetUid(requestBody.useridtoken)
  event.cookies.set("firebaseuid", uid, {
    path: "/",
    maxAge: 60 * 60 * 24 * 2, // say, 2 days
  })
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export function DELETE() {
  // do something
}
