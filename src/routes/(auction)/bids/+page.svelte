<script>
  import { enhance } from "$app/forms"
  import BidButtons from "./BidButtons.svelte"
  import { BID_OPTIONS } from "$lib/constants"

  /**
   * @typedef {Object} Props
   * @property {import('./$types').ActionData} form
   * @property {import('../$types').LayoutParams} params
   * @property {import('./$types').PageData} data
   */

  /** @type {Props} */
  let { form, data, params } = $props()

  /** @type{Array<number>}*/
  let bids = $state(Array(15))
  bids.fill(0)

  let auctionNumber = $derived(params.auction_number)
  let round = $derived(parseInt(params.round))
  let previousRound = $derived(round - 1)
  let newResultsAreReady = $derived(data.roundOfLatestResults >= round)
  let remainingPoints = $derived(data.points.at(data.seat))
  let auctionSize = $derived(data.points.length)
  let options = $derived(BID_OPTIONS.get(auctionSize)?.at(data.seat) || [])
  let sumOfBids = $derived(
    bids.reduce((sum, value) => sum + (options.at(value) || 0), 0),
  )
  let spendingRatio = $derived(
    sumOfBids / (remainingPoints ? remainingPoints : 1),
  )
</script>

<div class="navigation-container">
  <div class="previous-link">
    {#if previousRound && !newResultsAreReady}
      <a href={`/${auctionNumber}/${previousRound}/results`}>Previous Results</a
      >
    {/if}
  </div>
  <div
    class="spending-ratio"
    class:hidden={!spendingRatio}
    class:expensive={spendingRatio > 0.8}
    class:over-budget={spendingRatio > 1}
  >
    {sumOfBids} / {remainingPoints}
  </div>
  <div class="next-link">
    {#if newResultsAreReady}
      <a href={`/${auctionNumber}/${round}/results`}>New Results</a>
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
  <input hidden={true} value={JSON.stringify(bids)} name="bids" />
  <div class="input-container">
    {#each { length: bids.length }, index}
      <BidButtons bind:bidValue={bids[index]} {index} {options} />
    {/each}
  </div>
  {#if !newResultsAreReady}
    <button type="submit">Bid!</button>
  {/if}
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

  h3 {
    margin: 0.25em;
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
