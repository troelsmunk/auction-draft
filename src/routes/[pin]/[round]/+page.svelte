<script>
  import { currentRound } from "$lib/stores"

  /** @type {import('./$types').PageData} */
  export let data
  export let form

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
    return `/${data.pin}/${$currentRound - 1}/results`
  }
</script>

{#if $currentRound > round}
  <a href={currentRoundResultsAddress()}>New Results</a>
{:else if round > 1}
  <a href={previousRoundResultsAddress()}>Back to Results</a>
{/if}

<h3>Bidding</h3>
<form id="bid-form" method="POST" action="?/submit">
  <input hidden="true" value={JSON.stringify(bids)} name="bids" />
  <div class="input-container">
    {#each Object.keys(bids) as i}
      <div>
        <label for="bid-{i}">{i}</label>
      </div>
      <div>
        <input
          id="bid-{i}"
          type="number"
          bind:value={bids[i]}
          min="0"
          max="99"
        />
      </div>
    {/each}
  </div>
  <button type="submit">Bid!</button>
</form>

{#if form?.success === true}
  Bid received
{:else if form && !form.success}
  <div class="error">
    Bid denied: {form.error}
  </div>
{/if}

<style>
  .input-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr 3fr);
  }

  .input-container > * {
    margin-top: 8px;
  }

  button {
    float: right;
  }

  label {
    text-align: center;
  }

  .error {
    color: red;
  }
</style>
