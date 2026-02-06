<script>
  import ScoreItem from "./ScoreItem.svelte"
  /** @type {import('./$types').LayoutData} */
  export let data
</script>

{#if data?.error}
  <p class="error">{data.error}</p>
{:else}
  <div class="scoreboard">
    {#each data.colors as color, i}
      <!-- <ScoreItem {color} you={i == data.seat} score={data.scores[i]} /> -->
    {/each}
  </div>

  <slot />
{/if}

<style>
  .scoreboard {
    display: flex;
    justify-content: center;
    margin: 0.5em 0;
  }
</style>
