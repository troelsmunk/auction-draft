<script>
  export let bid = false
</script>

<div class="input-div">
  <button on:click|preventDefault={() => (bid += 5)}>+5</button>
  <button on:click|preventDefault={() => bid++}>+</button>
  <button on:click|preventDefault={() => bid--}>-</button>
</div>
<span>{bid}</span>

<style>
  .input-div {
    margin-top: 8px;
    display: grid;
    grid-template-rows: 1fr 2fr 1fr;
  }
</style>
