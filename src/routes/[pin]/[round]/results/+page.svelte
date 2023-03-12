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

  function nextRoundBiddingAddress() {
    const nextRound = parseInt(data.round) + 1
    return `/${data.pin}/${nextRound}`
  }
</script>

<a href={nextRoundBiddingAddress()}>Next round </a>
<h3>Results</h3>

<!-- TODO data.results instead of result -->
{#each Object.entries(results) as [i, card]}
  <p style:color={card.winner}>
    {card.bid}
  </p>
{/each}
