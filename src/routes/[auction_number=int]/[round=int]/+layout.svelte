<script>
  import { browser } from "$app/environment"
  import ScoreItem from "./ScoreItem.svelte"
  import { COLOURS } from "$lib/constants"
  import { invalidateAll } from "$app/navigation"

  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   * @property {import('./$types').PageData} data
   */

  /** @type {Props} */
  let { children, data } = $props()

  if (browser) {
    let eventSource = new EventSource("/api/subscribe/")

    eventSource.onmessage = (event) => {
      invalidateAll()
    }

    eventSource.onerror = (event) => {
      console.error("SSE connection error", event)
    }

    window.addEventListener("beforeunload", () => {
      eventSource.close()
    })
  }
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
