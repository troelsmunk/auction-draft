<script>
  /** @type {import('./$types').PageData} */
  export let data

  let results = {
    "1": {
      winner: "blue",
      bid: 5,
    },
    "2": {
      winner: "green",
      bid: 5,
    },
    "3": {
      winner: "blue",
      bid: 5,
    },
    //...
    "15": {
      winner: "red",
      bid: 2,
    },
  }
</script>

<h3>This are results</h3>

<!-- TODO data.results instead of result -->
{#each Object.entries(results) as [i, card]}
  <p style:color={card.winner}>
    {card.bid}
  </p>
{/each}
