<script>
  import ScoreItem from "./ScoreItem.svelte"
  import { page } from "$app/state"

  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props()
</script>

<div class="scoreboard">
  {#each page.data.colors as color, i}
    <ScoreItem {color} you={i == page.data.seat} score={/*dummy*/ i} />
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
