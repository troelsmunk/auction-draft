<script>
  import { page } from "$app/state"
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props()
  let auctionNumber = $derived(parseInt(page.params.auction_number))
  let round = $derived(parseInt(page.params.round))
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
