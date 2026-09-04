<script>
  import { ITEM_COUNT } from "$lib/constants"
  import { enhance } from "$app/forms"
  import BidButton from "./BidButton.svelte"

  /**
   * @typedef {Object} Props
   * @property { number } sumOfBids
   * @property { import('$lib/constants').userBidOptions } options
   */

  /** @type {Props} */
  let { sumOfBids = $bindable(), options } = $props()

  /** @type{Array<number>}*/
  let bids = $state(Array(ITEM_COUNT).fill(0))

  $effect(() => {
    sumOfBids = bids.reduce((sum, value) => sum + (options.at(value) || 0), 0)
  })
</script>

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

<style>
  button {
    float: right;
  }
  .grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
</style>
