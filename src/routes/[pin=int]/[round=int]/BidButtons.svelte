<script>
  export let bidValue = false
  export let i

  function plusFive(iValue) {
    if (iValue == i) {
      bidValue += 5
    }
  }
  function plusOne(iValue) {
    if (iValue == i) {
      bidValue++
    }
  }
  function minusOne(iValue) {
    if (iValue == i && bidValue > 0) {
      bidValue--
    }
  }
</script>

<div class="container">
  <span class="bid">
    {#if bidValue != null}
      {bidValue}
    {/if}
  </span>
  <label for="plus-five-{i}" class="plus-five">+5</label>
  <label for="plus-one-{i}" class="plus-one">+</label>
  <label for="minus-one-{i}" class="minus-one">-</label>
  <button
    id="plus-five-{i}"
    class="plus-five"
    aria-labelledby="plus-five-item-{i}"
    on:click|preventDefault={plusFive(i)}
  >
  </button>
  <button
    id="plus-one-{i}"
    class="plus-one"
    aria-labelledby="plus-one-item-{i}"
    on:click|preventDefault={plusOne(i)}
  >
  </button>
  <button
    id="minus-one-{i}"
    class="minus-one"
    aria-labelledby="minus-one-item-{i}"
    on:click|preventDefault={minusOne(i)}
  >
  </button>
</div>

<style>
  .container {
    margin: 0.3em;
    border: 1px darkgray solid;
    display: grid;
    grid-template-rows: repeat(4, 1.5em);
    grid-template-columns: repeat(5, 1fr);
  }

  button {
    border: none;
    background: linear-gradient(to right, lightgrey, transparent);
  }

  label {
    text-align: center;
  }

  label.plus-five {
    font-size: small;
    grid-area: 1 / 1 / 2 / 3;
  }
  label.plus-one {
    font-size: large;
    grid-area: 2 / 1 / 4 / 3;
    align-self: center;
  }
  label.minus-one {
    font-size: large;
    grid-area: 4 / 1 / 5 / 3;
  }
  button.plus-five {
    grid-area: 1 / 1 / 2 / 6;
  }
  button.plus-one {
    border-width: 2px 0px;
    border-style: solid;
    border-image: linear-gradient(to right, darkgray, transparent) 6;
    grid-area: 2 / 1 / 4 / 6;
  }
  button.minus-one {
    grid-area: 4 / 1 / 5 / 6;
  }

  .bid {
    grid-area: 1 / 2 / 5 / 6;
    font-size: xx-large;
    text-align: center;
    align-self: center;
  }
</style>
