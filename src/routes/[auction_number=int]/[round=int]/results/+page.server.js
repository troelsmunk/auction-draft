export async function load({}) {
  return {
    results: JSON.stringify({ res: "resultsFromDatabase" }),
  }
}
