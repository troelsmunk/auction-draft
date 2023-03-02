/** @type {import('./$types').Actions} */
export const actions = {
  login: async ({ cookie, request }) => {
    return { success: true }
  },
  register: async (event) => {
    database.setIndexSize(parseInt(event.numberOfBidders))
    database.listenForPin()
  },
}
