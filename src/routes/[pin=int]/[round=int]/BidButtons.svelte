<script>
  export let bid = false
</script>

<div class="outer">
  <div class="buttons">
    <button class="small" on:click|preventDefault={() => (bid += 5)}>+5</button>
    <button on:click|preventDefault={() => bid++}>+</button>
    <button class="small" on:click|preventDefault={() => bid--}>-</button>
  </div>
  <span class="bid">{bid}</span>
</div>

<style>
  .outer {
    margin: 5px;
    /* allow bid and buttons in the same space */
  }

  .buttons {
    display: grid;
    grid-template-rows: 1fr 2fr 1fr;
  }

  button {
    text-align: left;
    border-left: none;
    border-right: none;
    /* faded out */
  }

  button.small {
    border: none;
  }

  .bid {
    grid-row: 1 / 4;
    font-size: larger;
    /* text a little to the right */
  }
</style>
