<script>
  export let bid = false

  function subtract() {
    if (bid > 0) bid--
  }
</script>

<div class="container">
  <span class="bid">
    {#if bid != null}
      {bid}
    {/if}
  </span>
  <button class="plus-five" on:click|preventDefault={() => (bid += 5)}
    >+5</button
  >
  <button class="plus-one" on:click|preventDefault={() => bid++}>+</button>
  <button class="minus-one" on:click|preventDefault={subtract}>-</button>
</div>

<style>
  .container {
    margin: 0.3em;
    border: 1px darkgray solid;
    border-radius: 0.5em;
    display: grid;
    grid-template-rows: repeat(4, 1.5em);
    grid-template-columns: repeat(5, 1fr);
  }

  button {
    text-align: left;
    border: none;
    background: linear-gradient(to right, lightgrey, transparent);
  }

  button.plus-five {
    font-size: small;
    grid-area: 1 / 1 / 2 / 6;
  }
  button.plus-one {
    font-size: large;
    border-width: 2px 0px;
    border-style: solid;
    border-image: linear-gradient(to right, darkgray, transparent) 6;
    grid-area: 2 / 1 / 4 / 6;
  }
  button.minus-one {
    font-size: large;
    grid-area: 4 / 1 / 5 / 6;
  }

  .bid {
    grid-area: 1 / 2 / 5 / 6;
    font-size: xx-large;
    text-align: center;
    align-self: center;
  }
</style>
