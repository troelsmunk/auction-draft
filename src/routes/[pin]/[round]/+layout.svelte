<script>
  import ScoreItem from "./ScoreItem.svelte"
  /** @type {import('./$types').LayoutData} */
  export let data
</script>

<div class="scoreboard">
  {#each data.colors as color, i}
    <ScoreItem
      {color}
      opener={i + 1 == data.round % data.size}
      you={i == data.seat}
      score={data.scores[i]}
    />
  {/each}
</div>

<slot />

<style>
  .scoreboard {
    display: flex;
    justify-content: center;
  }
</style>
