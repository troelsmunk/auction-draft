<script>
  export let bid = false
</script>

<div class="outer">
  <span class="bid">{bid}</span>
  <button class="plus-five" on:click|preventDefault={() => (bid += 5)}
    >+5</button
  >
  <button class="plus-one" on:click|preventDefault={() => bid++}>+</button>
  <button class="minus-one" on:click|preventDefault={() => bid--}>-</button>
</div>

<style>
  .outer {
    margin: 5px;
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    grid-template-columns: repeat(5, 1fr);
  }

  button {
    text-align: left;
    border: none;
    opacity: 0.5;
  }

  button.plus-five {
    grid-area: 1 / 1 / 2 / 6;
  }
  button.plus-one {
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
