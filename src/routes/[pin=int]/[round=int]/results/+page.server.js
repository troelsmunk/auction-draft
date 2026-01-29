export async function load({ params }) {
  // const resultsFromDatabase = await admin
  //   .database()
  //   .ref(`auctions/${params.pin}/results/rounds/${params.round}`)
  //   .get()
  //   .then((snap) => snap.val())
  return {
    results: JSON.stringify({res: "resultsFromDatabase"}),
  }
}
