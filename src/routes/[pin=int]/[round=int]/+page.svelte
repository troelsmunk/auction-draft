<script>
  import { bidByButtons, currentRound } from "$lib/stores"
  import { enhance } from "$app/forms"
  import { page } from "$app/stores"
  import KeyboardBidItem from "./KeyboardBidItem.svelte"
  import BidButtons from "./BidButtons.svelte"

  export let form
  export let data

  let bids = Array(15)
  bids.fill(null)
  $: sumOfBids = bids.reduce((sum, value) => sum + value)
  const bankSum = data.scores[data.seat]
  $: spendingRatio = sumOfBids / bankSum

  const round = parseInt($page.params.round)

  function previousRoundResultsAddress() {
    return `/${$page.params.pin}/${round - 1}/results`
  }
  function currentRoundResultsAddress() {
    return `/${$page.params.pin}/${$currentRound - 1}/results`
  }
</script>

<div class="navigation-container">
  <div class="previous-link">
    {#if round > 1 && round >= $currentRound}
      <a href={previousRoundResultsAddress()}>Previous Results</a>
    {/if}
  </div>
  <div
    class="spending-ratio"
    class:hidden={!sumOfBids}
    class:expensive={spendingRatio > 0.8}
    class:over-budget={spendingRatio > 1}
  >
    {sumOfBids} / {bankSum}
  </div>
  <div class="next-link">
    {#if $currentRound > round}
      <a href={currentRoundResultsAddress()}>New Results</a>
    {/if}
  </div>
</div>

<h3>Bidding</h3>
<form
  id="bid-form"
  method="POST"
  action="?/submit"
  use:enhance={() => {
    return async ({ update }) => {
      await update({ reset: false })
    }
  }}
>
  <input hidden="true" value={JSON.stringify(bids)} name="bids" />
  <div class="input-container">
    {#each bids as bid, i}
      {#if $bidByButtons}
        <BidButtons bind:bid />
      {:else}
        <KeyboardBidItem bind:bid {i} />
      {/if}
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
  .navigation-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .previous-link {
    justify-self: left;
  }
  .spending-ratio {
    justify-self: center;
  }
  .hidden {
    opacity: 0;
  }
  .next-link {
    justify-self: right;
  }

  .input-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  button {
    float: right;
  }

  .error {
    color: red;
  }

  .expensive {
    color: orange;
  }

  .expensive.over-budget {
    color: red;
  }
</style>
