import { admin } from "$lib/admin.server"

export async function load({ params }) {
  const resultsFromDatabase = await admin
    .database()
    .ref(`auctions/${params.pin}/results/rounds/${params.round}/cards`)
    .get()
  return {
    results: JSON.stringify(resultsFromDatabase),
  }
}
