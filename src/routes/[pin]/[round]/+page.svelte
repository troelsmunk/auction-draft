<script>
  import { seat, userIdToken, opener } from "$lib/stores"

  /**
   * @type {number[]}
   */
  let bids = new Array(15).fill(0)

  /**
   *
   * @param {number} i
   * @returns {string}
   */
  const bidNum = function (i) {
    return (i + 1).toString()
  }

  function resultsAddress() {
    return `/${data.post.pin}/${parseInt(data.post.round) - 1}/results`
  }

  /** @type {import('./$types').PageData} */
  export let data

  // TODO: try to go back to userIdToken, without $
  let idTokenValue
  userIdToken.subscribe((value) => {
    idTokenValue = value
  })
</script>

<a href={resultsAddress()}>Back to Results</a>

<p>You are in seat {$seat}</p>
<p>{$opener} should open the next pack</p>

<!-- Bidding headline -->
<form id="bid-form" method="POST" action="?/submit">
  <input hidden="true" value={idTokenValue} name="user-id-token" />
  <input hidden="true" bind:value={bids} name="bids" />
  {#each bids as bid, i}
    <div>
      <label for={bidNum(i)}>{bidNum(i)}</label>
      <input
        id={bidNum(i)}
        type="number"
        bind:value={bids[i]}
        min="0"
        max="99"
      />
    </div>
  {/each}
  <button type="submit">Bid!</button>
</form>

<style>
  form {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  button {
    align-self: end;
    background-color: lightgreen;
  }
</style>
