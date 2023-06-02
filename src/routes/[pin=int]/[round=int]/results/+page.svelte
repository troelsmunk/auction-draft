<script>
  import { page } from "$app/stores"
  /** @type {import('./$types').PageData} */
  export let data

  let results = JSON.parse(data.results)

  function nextRoundBiddingAddress() {
    const nextRound = parseInt($page.params.round) + 1
    return `/${$page.params.pin}/${nextRound}`
  }
</script>

<a href={nextRoundBiddingAddress()}>Next round </a>

<h3>Results</h3>
<div class="grid-container">
  {#each Object.values(results) as card}
    <div class="result" style:background-color={data.colors[card.seat]}>
      {card.bid}
    </div>
  {/each}
</div>

<style>
  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  .result {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    font-weight: bold;
  }
</style>
