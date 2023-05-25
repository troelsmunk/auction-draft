<script>
  import ScoreItem from "./ScoreItem.svelte"
  import { page } from "$app/stores"
  /** @type {import('./$types').LayoutData} */
  export let data
</script>

{#if data?.error}
  <p class="error">{data.error}</p>
{:else}
  <div class="scoreboard">
    {#each data.colors as color, i}
      <ScoreItem
        {color}
        opener={i + 1 == $page.params.round % data.size}
        you={i == data.seat}
        score={data.scores[i]}
      />
    {/each}
  </div>

  <slot />
{/if}

<style>
  .scoreboard {
    display: flex;
    justify-content: center;
  }
</style>
