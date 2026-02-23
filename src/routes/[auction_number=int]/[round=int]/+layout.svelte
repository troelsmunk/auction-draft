<script>
  import ScoreItem from "./ScoreItem.svelte"
  import { COLOURS } from "$lib/constants"

  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {import('./$types').PageProps & Props} */
  let { children, data } = $props()
</script>

<div class="scoreboard">
  {#each data.points as pointsForOneUser, i}
    <ScoreItem
      color={COLOURS.at(i)}
      you={i == data.seat}
      score={pointsForOneUser}
    />
  {/each}
</div>

{@render children?.()}

<style>
  .scoreboard {
    display: flex;
    justify-content: center;
    margin: 0.5em 0;
  }
</style>
