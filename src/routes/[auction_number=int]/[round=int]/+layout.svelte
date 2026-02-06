<script>
  import ScoreItem from "./ScoreItem.svelte"
  /** @type {import('./$types').LayoutData} */
  export let data
</script>

<div class="scoreboard">
  {#each data.colors as color, i}
    <ScoreItem {color} you={i == data.seat} score={data.seat} />
  {/each}
</div>

<slot />

<style>
  .scoreboard {
    display: flex;
    justify-content: center;
    margin: 0.5em 0;
  }
</style>
