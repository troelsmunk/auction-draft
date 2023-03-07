<script>
  import { auth, uid, loading } from "$lib/stores"
  import { signInAnonymously, signOut } from "firebase/auth"
  import Database from "$lib/Database.svelte"

  let database
  let pinFromForm
</script>

{#if $uid}
  <Database bind:this={database} uid={$uid} />
{/if}

<button on:click={signInAnonymously($auth)}>Login</button>
<button on:click={signOut($auth)}>Logout</button>

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
    <button type="submit" disabled={$loading}>Join Auction</button>
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
