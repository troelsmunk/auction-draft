<script>
  import ScoreItem from "./ScoreItem.svelte"
  import { page } from "$app/state"
  import { COLOURS } from "$lib/constants"

  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props()
  let { points, seat } = page.data
</script>

<div class="scoreboard">
  {#each points as pointsForOneUser, i}
    <ScoreItem color={COLOURS.at(i)} you={i == seat} score={pointsForOneUser} />
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
