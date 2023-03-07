import { validateUserAndGetUid } from "$lib/admin.server"
import { redirect } from "@sveltejs/kit"

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies, request }) {
  const { userIdToken } = await request.json()
  const uid = await validateUserAndGetUid(userIdToken)
  cookies.set("uid", uid, {
    path: "/",
    maxAge: 60 * 60 * 24 * 2, // say, 2 days
  })
  console.log("throw redirect(301, `/cookied`)")
  throw redirect(302, `/cookied`)
  // return new Response(uid, { status: 201 })
}

/** @type {import('./$types').RequestHandler} */
export function DELETE() {
  // do something
}
