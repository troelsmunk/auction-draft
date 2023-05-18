<script>
  import { getAuth, signInAnonymously, signOut } from "firebase/auth"
  import { uid, firebaseApp } from "$lib/stores"

  export let form

  function signIn() {
    return signOut(getAuth($firebaseApp)).then(() =>
      signInAnonymously(getAuth($firebaseApp))
    )
  }
</script>

{#if $uid}
  <h3>One of you, create an auction</h3>
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  <form id="create-form" method="POST" action="?/create">
    <label for="auction-size">Choose how many bidders: </label>
    <select name="auction-size" form="create-form">
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4" selected>4</option>
      <option value="5">5</option>
      <option value="6">6</option>
    </select>
    <button type="submit">Create Auction</button>
  </form>

  <h3>The rest of you, join that auction:</h3>
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  <form id="join-form" method="POST" action="?/join">
    <label for="pin">Insert PIN:</label>
    <input
      name="pin"
      type="text"
      inputmode="numeric"
      placeholder="e.g.1234"
      required
      value={form?.pin ?? ""}
    />
    <button type="submit">Join Auction</button>
  </form>
{:else}
  <h3>Do you like cookies?</h3>
  <button on:click={signIn}>Cookies!</button>
{/if}

<style>
  .error {
    color: red;
  }
</style>
