<script>
  export let bid = false
  export let i = false
</script>

<div class="input-container">
  <div>
    <label for="bid-{i + 1}">{i + 1}</label>
  </div>
  <div>
    <input id="bid-{i + 1}" type="number" bind:value={bid} min="0" max="99" />
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
