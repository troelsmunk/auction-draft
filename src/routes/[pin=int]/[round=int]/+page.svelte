<script>
  import { currentRound } from "$lib/stores"
  import { enhance } from "$app/forms"
  import { page } from "$app/stores"

  export let form

  let bids = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]

  const round = parseInt($page.params.round)

  function previousRoundResultsAddress() {
    return `/${$page.params.pin}/${round - 1}/results`
  }
  function currentRoundResultsAddress() {
    return `/${$page.params.pin}/${$currentRound - 1}/results`
  }
</script>

{#if $currentRound > round}
  <a href={currentRoundResultsAddress()}>New Results</a>
{:else if round > 1}
  <a href={previousRoundResultsAddress()}>Back to Results</a>
{/if}

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
      <div>
        <label for="bid-{i + 1}">{i + 1}</label>
      </div>
      <div>
        <input
          id="bid-{i + 1}"
          type="number"
          bind:value={bid}
          min="0"
          max="99"
        />
      </div>
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
  .input-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr 3fr);
  }

  .input-container > * {
    margin-top: 8px;
  }

  button {
    float: right;
  }

  label {
    text-align: center;
  }

  .error {
    color: red;
  }
</style>
