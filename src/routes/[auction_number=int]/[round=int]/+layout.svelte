<script>
  import { page } from "$app/state"
  import { browser } from "$app/environment"
  import ScoreItem from "./ScoreItem.svelte"
  import { COLOURS } from "$lib/constants"
  import { invalidateAll } from "$app/navigation"

  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {import('./$types').PageProps & Props} */
  let { children, data } = $props()

  if (browser) {
    let eventSource = new EventSource("/api/data/" + page.params.auction_number)

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
