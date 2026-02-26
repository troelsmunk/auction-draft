<script>
  import { COLOURS } from "$lib/constants"

  /**
   * @typedef {Object} Props
   * @property {import('./$types').PageData} data
   */

  /** @type {Props} */
  let { data } = $props()
  let results = $derived(data.results)
</script>

<div class="container">
  <a class="next-link" href={`/bids`}>Next round </a>
</div>

<h3>Results</h3>
<div class="grid-container">
  {#each Object.values(results) as card}
    <div class="result" style:background-color={COLOURS[card.seat]}>
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
