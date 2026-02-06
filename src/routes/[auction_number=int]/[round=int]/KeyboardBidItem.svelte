<script>
  /** @type { number }*/
  export let bidValue
  /** @type { number }*/
  export let index
</script>

<div class="input-container">
  <div>
    <label for="bid-{index + 1}">{index + 1}</label>
  </div>
  <div>
    <input
      id="bid-{index + 1}"
      type="number"
      bind:value={bidValue}
      min="0"
      max="99"
    />
  </div>
</div>

<style>
  label {
    text-align: center;
  }

  .input-container {
    margin: 5px;
    display: grid;
    grid-template-columns: 1fr 3fr;
  }
</style>
