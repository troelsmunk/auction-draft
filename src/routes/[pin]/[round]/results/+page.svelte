<script>
  /** @type {import('./$types').PageData} */
  export let data

  let resultsFromLoad = JSON.parse(data.results)
  let betterResults = {} // fix automatic addition of zero-field
  for (let i = 1; i <= 15; i++) {
    betterResults[i] = resultsFromLoad[i]
  }

  function nextRoundBiddingAddress() {
    const nextRound = parseInt(data.round) + 1
    return `/${data.pin}/${nextRound}`
  }
</script>

<a href={nextRoundBiddingAddress()}>Next round </a>

<h3>Results</h3>
<div class="grid-container">
  {#each Object.entries(betterResults) as [i, card]}
    <div
      class="result-wrapper"
      style:background-color={data.colors[card.winner]}
    >
      <div class="result-inner">
        {card.bid}
      </div>
    </div>
  {/each}
</div>

<style>
  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  .result-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
  }

  .result-inner {
    align-self: center;
    background-color: antiquewhite;
  }
</style>
