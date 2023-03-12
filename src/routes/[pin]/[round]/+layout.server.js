/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
  return {
    scores: [890, 200, 110, 90, 100, 200],
    round: params.round,
  }
}
