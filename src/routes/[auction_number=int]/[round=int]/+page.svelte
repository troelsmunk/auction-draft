<script>
  import { browser } from "$app/environment"
  import ScoreItem from "./ScoreItem.svelte"
  import { COLOURS } from "$lib/constants"
  import { invalidateAll } from "$app/navigation"
  import { BID_OPTIONS } from "$lib/constants"
  import BidForm from "./BidForm.svelte"

  /**
   * @typedef {Object} Props
   * @property {import('./$types').ActionData} form
   * @property {import('./$types').RouteParams} params
   * @property {import('./$types').PageData} data
   */

  /** @type {Props} */
  let { form, data, params } = $props()

  let auctionNumber = $derived(params.auction_number)
  let round = $derived(parseInt(params.round))
  let previousRound = $derived(round - 1)
  let nextRound = $derived(parseInt(params.round) + 1)
  let results = $derived(data.results)
  let remainingPoints = $derived(data.points.at(data.seat) || -1)
  let auctionSize = $derived(data.points.length)
  let options = $derived(BID_OPTIONS.get(auctionSize)?.at(data.seat) || [])
  let sumOfBids = $state(0)
  let spendingRatio = $derived(sumOfBids / remainingPoints)

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
    class:expensive={spendingRatio > 0.8}
    class:over-budget={spendingRatio > 1}
    hidden={Boolean(results) || spendingRatio <= 0}
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

{#if !results}
  <div class="header-container">
    <h3>Bidding</h3>
    <div class="options">Your bid options: {options.slice(1).join(", ")}</div>
  </div>
  <BidForm {options} bind:sumOfBids />
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
  .navigation-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .previous-link {
    justify-self: left;
  }
  .spending-ratio {
    justify-self: right;
  }
  .expensive {
    color: orange;
  }
  .expensive.over-budget {
    color: red;
  }
  .next-link {
    justify-self: right;
  }
  .header-container {
    display: flex;
    justify-content: space-between;
  }
  h3 {
    margin: 0.25em;
  }
  .options {
    align-self: center;
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
