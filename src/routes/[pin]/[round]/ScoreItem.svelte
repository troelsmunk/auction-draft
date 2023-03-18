<script>
  export let color = "green"
  export let opener = false
  export let you = false
  export let score = false
</script>

<div class="scoreboard-item" class:you style:background-color={color}>
  <div>
    {#if you}
      You
    {/if}
  </div>
  <div class="score">
    {score}
  </div>
  <div>
    {#if opener}
      Opener
    {/if}
  </div>
</div>

<style>
  .scoreboard-item {
    box-sizing: border-box;
    width: 100px;
    flex: 1;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .scoreboard-item > * {
    height: 17px;
  }

  .score {
    font-weight: bold;
  }

  .you {
    border: solid 0.2em;
  }
</style>
