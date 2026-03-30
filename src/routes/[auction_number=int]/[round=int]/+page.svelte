<script>
  import { browser } from "$app/environment"
  import ScoreItem from "./ScoreItem.svelte"
  import { COLOURS } from "$lib/constants"
  import { invalidateAll } from "$app/navigation"
  import { enhance } from "$app/forms"
  import BidButton from "./BidButtons.svelte"
  import { BID_OPTIONS } from "$lib/constants"

  /**
   * @typedef {Object} Props
   * @property {import('./$types').ActionData} form
   * @property {import('./$types').RouteParams} params
   * @property {import('./$types').PageData} data
   */

  /** @type {Props} */
  let { form, data, params } = $props()

  /** @type{Array<number>}*/
  let bids = $state(Array(15))

  let auctionNumber = $derived(params.auction_number)
  let round = $derived(parseInt(params.round))
  let previousRound = $derived(round - 1)
  let nextRound = $derived(parseInt(params.round) + 1)
  let results = $derived(data.results)
  let remainingPoints = $derived(data.points.at(data.seat))
  let auctionSize = $derived(data.points.length)
  let options = $derived(BID_OPTIONS.get(auctionSize)?.at(data.seat) || [])
  let sumOfBids = $derived(
    bids.reduce((sum, value) => sum + (options.at(value) || 0), 0),
  )
  let spendingRatio = $derived(
    sumOfBids / (remainingPoints ? remainingPoints : 1),
  )

  if (browser) {
    let eventSource = new EventSource("/api/subscribe/")

    eventSource.onmessage = (event) => {
      invalidateAll()
    }

    eventSource.onerror = (event) => {
      console.error("SSE connection error", event)
    }

    window.addEventListener("beforeunload", () => {
      eventSource.close()
    })
  }
</script>

<div class="scoreboard">
  {#each data.points as pointsForOneUser, i}
    <ScoreItem
      color={COLOURS.at(i)}
      you={i == data.seat}
      score={pointsForOneUser}
    />
  {/each}
</div>

<div class="navigation-container">
  <div class="previous-link">
    {#if previousRound}
      <a href={`/${auctionNumber}/${previousRound}`}>Previous Results</a>
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
    {#if results}
      <a class="next-link" href={`/${auctionNumber}/${nextRound}`}
        >Next round
      </a>
    {/if}
  </div>
</div>

<div class="bid-options-container">
  {#each options as option}
    {#if option > 0}
      <div class="bid-option">
        {option}
      </div>
    {/if}
  {/each}
</div>

{#if !results}
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
    <div class="grid-container">
      {#each { length: bids.length }, index}
        <BidButton bind:bidValue={bids[index]} {index} {options} />
      {/each}
    </div>
    <button type="submit">Bid!</button>
  </form>
  {#if form?.success}
    Bid received
  {:else if form?.error}
    <div class="error">
      Bid denied: {form.error}
    </div>
  {/if}
{:else}
  <h3>Results</h3>
  <div class="grid-container">
    {#each Object.values(results) as card}
      <div class="result" style:background-color={COLOURS[card.seat]}>
        {card.bid}
      </div>
    {/each}
  </div>
{/if}

<style>
  .scoreboard {
    display: flex;
    justify-content: center;
    margin: 0.5em 0;
  }
  .bid-options-container {
    display: flex;
    margin: 0.5em 0;
  }
  .bid-option {
    box-sizing: border-box;
    width: 100px;
    flex: 1;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

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
  .expensive {
    color: orange;
  }
  .expensive.over-budget {
    color: red;
  }
  .hidden {
    opacity: 0;
  }
  .next-link {
    justify-self: right;
  }
  h3 {
    margin: 0.25em;
  }
  button {
    float: right;
  }
  .error {
    color: red;
  }
  .grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
  .result {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    font-weight: bold;
  }
</style>
