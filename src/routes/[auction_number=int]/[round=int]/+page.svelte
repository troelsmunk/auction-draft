<script>
  import { bidByButtons, currentRound } from "$lib/stores"
  import { enhance } from "$app/forms"
  import { page } from "$app/state"
  import KeyboardBidItem from "./KeyboardBidItem.svelte"
  import BidButtons from "./BidButtons.svelte"
  import { browser } from "$app/environment"
  import { writable } from "svelte/store"
  import { BID_OPTIONS } from "$lib/constants"

  /**
   * @typedef {Object} Props
   * @property {import('./$types').ActionData} form
   */

  /** @type {Props} */
  let { form } = $props()

  /** @type{Array<number>}*/
  let bids = $state(Array(15))
  bids.fill(0)
  let { points, seat } = page.data
  const remainingPoints =
    points && typeof seat == "number" ? points.at(seat) : 0
  const auctionSize = points?.length || 0
  const options = BID_OPTIONS.get(auctionSize)?.at(seat || 0)
  let sumOfBids = $derived(
    bids.reduce((sum, value) => sum + (options?.at(value) || 0), 0),
  )
  let spendingRatio = $derived(
    sumOfBids / (remainingPoints ? remainingPoints : 1),
  )

  const round = parseInt(page.params.round)

  function previousRoundResultsAddress() {
    return `/${page.params.auction_number}/${round - 1}/results`
  }
  function currentRoundResultsAddress() {
    return `/${page.params.auction_number}/${$currentRound - 1}/results`
  }
  const messages = writable([])

  if (browser) {
    let eventSource = new EventSource("/api/data/" + page.params.auction_number)

    eventSource.onmessage = function (event) {
      try {
        var dataobj = JSON.parse(event.data)
        messages.update((arr) => arr.concat(dataobj))
        console.log("Received update:", dataobj)
      } catch (e) {
        console.error("Error parsing message:", e)
      }
    }

    eventSource.onerror = (event) => {
      console.error("SSE connection error", event)
    }

    window.addEventListener("beforeunload", () => {
      eventSource.close()
    })
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
    class:hidden={!spendingRatio}
    class:expensive={spendingRatio > 0.8}
    class:over-budget={spendingRatio > 1}
  >
    {sumOfBids} / {remainingPoints}
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
  <input hidden={true} value={JSON.stringify(bids)} name="bids" />
  <div class="input-container">
    {#each { length: bids.length }, index}
      {#if $bidByButtons}
        <BidButtons bind:bidValue={bids[index]} {index} {options} />
      {:else}
        <KeyboardBidItem bind:bidValue={bids[index]} {index} />
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

<div>
  <h3>Live Updates ({$messages.length})</h3>
  {#each $messages as m}
    <p>{JSON.stringify(m)}</p>
  {/each}
</div>

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
