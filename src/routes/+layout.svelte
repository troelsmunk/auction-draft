<script>
  import { bidByButtons } from "$lib/stores"
  import { page } from "$app/state"
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
    <div class="feature-toggle">
      <label for="bid-method">Buttons!</label>
      <input id="bid-method" type="checkbox" bind:checked={$bidByButtons} />
    </div>
  </div>
{:else}
  <h1>Blind Auction Drafting</h1>
{/if}

<slot />

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
  .feature-toggle {
    justify-self: right;
  }
</style>
