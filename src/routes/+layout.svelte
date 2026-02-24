<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   * @property {import('./$types').LayoutParams} params
   */

  /** @type {Props} */
  let { children, params } = $props()
  let auctionNumber = $derived(params.auction_number)
  let round = $derived(params.round)
</script>

{#if auctionNumber}
  <div class="header-container">
    <div class="breadcrumb">
      <a href="/"> Home </a>
      - Auction {auctionNumber}
      {#if round}
        - Round {round}
      {/if}
    </div>
  </div>
{:else}
  <h1>Blind Auction Drafting</h1>
{/if}

{@render children?.()}

<style>
  ::global(*) {
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans,
      Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  .header-container {
    display: grid;
    grid-template-columns: auto auto;
  }
</style>
