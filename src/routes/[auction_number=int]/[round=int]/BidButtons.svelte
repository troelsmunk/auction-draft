<script>
  /**
   * @typedef {Object} Props
   * @property { number } bidValue
   * @property { number } index
   * @property { import('$lib/constants').userBidOptions } options
   */

  /** @type {Props} */
  let { bidValue = $bindable(), index, options } = $props()

  /** @type { (event: Event) => void  }*/
  function plusOne(event) {
    event.preventDefault()
    bidValue++
  }
  /** @type { (event: Event) => void  }*/
  function minusOne(event) {
    event.preventDefault()
    if (bidValue > 0) {
      bidValue--
    }
  }
</script>

<div class="container">
  <span class="bid">
    {#if bidValue != null}
      {options.at(bidValue)}
    {/if}
  </span>
  <label for="plus-one-{index}" class="plus-one">+</label>
  <label for="minus-one-{index}" class="minus-one">-</label>
  <button
    id="plus-one-{index}"
    class="plus-one"
    aria-labelledby="plus-one-item-{index}"
    onclick={(event) => plusOne(event)}
  >
  </button>
  <button
    id="minus-one-{index}"
    class="minus-one"
    aria-labelledby="minus-one-item-{index}"
    onclick={(event) => minusOne(event)}
  >
  </button>
</div>

<style>
  .container {
    margin: 0.3em;
    border: 1px darkgray solid;
    display: grid;
    grid-template-rows: repeat(6, 1em);
    grid-template-columns: repeat(5, 1fr);
  }

  button {
    border: none;
    background: linear-gradient(to right, lightgrey, transparent);
  }

  label {
    text-align: center;
  }

  label.plus-one {
    font-size: large;
    grid-area: 1 / 1 / 5 / 3;
    align-self: center;
  }
  label.minus-one {
    font-size: large;
    grid-area: 5 / 1 / 7 / 3;
  }
  button.plus-one {
    border-width: 2px 0px;
    border-style: solid;
    border-image: linear-gradient(to right, darkgray, transparent) 6;
    grid-area: 1 / 1 / 5 / 6;
  }
  button.minus-one {
    grid-area: 5 / 1 / 7 / 6;
  }

  .bid {
    grid-area: 1 / 2 / 5 / 6;
    font-size: xx-large;
    text-align: center;
    align-self: center;
  }
</style>
