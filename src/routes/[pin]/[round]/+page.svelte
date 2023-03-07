<script>
  /** @type {import('./$types').PageData} but also LayoutData*/
  export let data

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
    return `/${data.pin}/${parseInt(data.round) - 1}/results`
  }
</script>

<a href={resultsAddress()}>Back to Results</a>

<!-- Bidding headline -->
<form id="bid-form" method="POST" action="?/submit">
  <input hidden="true" name="user-id-token" />
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
