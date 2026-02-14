<script>
  import ScoreItem from "./ScoreItem.svelte"
  import { page } from "$app/state"

  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props()
  let { colors, points, seat } = page.data
</script>

<div class="scoreboard">
  {#each colors as color, i}
    <ScoreItem {color} you={i == seat} score={points?.at(i)} />
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
