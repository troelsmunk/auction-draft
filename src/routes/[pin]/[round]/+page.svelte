<script>
  import { currentRound } from "$lib/stores"

  /** @type {import('./$types').PageData} */
  export let data

  let bids = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null,
    10: null,
    11: null,
    12: null,
    13: null,
    14: null,
    15: null,
  }

  const round = parseInt(data.round)

  function previousRoundResultsAddress() {
    return `/${data.pin}/${round - 1}/results`
  }
  function currentRoundResultsAddress() {
    return `/${data.pin}/${$currentRound}/results`
  }
</script>

{#if round > 1}
  <a href={previousRoundResultsAddress()}>Back to Results</a>
{/if}
{#if $currentRound > round}
  <a href={currentRoundResultsAddress()}>New Results</a>
{/if}

<!-- Bidding headline -->
<form id="bid-form" method="POST" action="?/submit">
  <input hidden="true" value={JSON.stringify(bids)} name="bids" />
  {#each Object.keys(bids) as i}
    <div>
      <label for={i}>{i}</label>
      <input id={i} type="number" bind:value={bids[i]} min="0" max="99" />
    </div>
  {/each}
  <button type="submit">Bid!</button>
</form>

<style>
  form {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  button {
    align-self: end;
    background-color: lightgreen;
  }
</style>
