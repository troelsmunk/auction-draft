<script>
  import { page } from "$app/state"

  let results = JSON.parse(page.data.results)

  function nextRoundBiddingAddress() {
    const nextRound = parseInt(page.params.round) + 1
    return `/${page.params.auction_number}/${nextRound}`
  }
</script>

<div class="container">
  <a class="next-link" href={nextRoundBiddingAddress()}>Next round </a>
</div>

<h3>Results</h3>
<div class="grid-container">
  {#each Object.values(results) as card}
    <div class="result" style:background-color={page.data.colors[card.seat]}>
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

  .container {
    display: grid;
  }

  .next-link {
    justify-self: right;
  }
</style>
