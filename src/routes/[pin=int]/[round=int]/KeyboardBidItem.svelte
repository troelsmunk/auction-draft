<script>
  export let bid = false
  export let i = false
</script>

<div class="input-div">
  <label for="bid-{i + 1}">{i + 1}</label>
</div>
<div class="input-div">
  <input id="bid-{i + 1}" type="number" bind:value={bid} min="0" max="99" />
</div>

<style>
  .input-div {
    margin-top: 8px;
  }

  label {
    text-align: center;
  }
</style>
