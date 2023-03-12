<script>
  /** @type {import('./$types').PageData} */
  export let data

  function nextRoundBiddingAddress() {
    const nextRound = parseInt(data.round) + 1
    return `/${data.pin}/${nextRound}`
  }
</script>

<a href={nextRoundBiddingAddress()}>Next round </a>

<h3>Results</h3>
{#each Object.entries(JSON.parse(data.results)) as [i, card]}
  <p style:color={data.colors[card.winner]}>
    {card.bid}
  </p>
{/each}
