<script>
  import { uid } from "$lib/stores"
  import Database from "$lib/Database.svelte"

  // Use form action instead
  let database
  let pinFromForm
</script>

<!-- Move to layout -->
{#if $uid}
  <Database bind:this={database} uid={$uid} />
{/if}

<div class="main">
  <h3>The rest of you, join that auction:</h3>
  <form id="join-form" method="POST" action="?/login">
    <label for="pin">Insert PIN:</label>
    <input
      bind:value={pinFromForm}
      name="pin"
      type="text"
      inputmode="numeric"
      placeholder="e.g.1234"
      required
      pattern="[0-9][0-9][0-9][0-9]"
    />
    <button type="submit">Join Auction</button>
  </form>
</div>

<style>
  .main {
    display: grid;
    justify-content: center;
    border: 2px black solid;
    padding: 1em;
    overflow: hidden;
  }
</style>
