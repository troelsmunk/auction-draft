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
  <label for="plus-five" class="plus-five">+5</label>
  <label for="plus-one" class="plus-one">+</label>
  <label for="minus-one" class="minus-one">-</label>
  <button
    id="plus-five"
    class="plus-five"
    on:click|preventDefault={() => (bid += 5)}
  />
  <button
    id="plus-one"
    class="plus-one"
    on:click|preventDefault={() => bid++}
  />
  <button id="minus-one" class="minus-one" on:click|preventDefault={subtract} />
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
