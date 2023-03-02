<script>
  import { auth, pin, uid, loading } from "$lib/stores"
  import { signInAnonymously } from "firebase/auth"
  import Database from "$lib/Database.svelte"

  export let form
  export let data

  let database
  let numberOfBidders
  let pinFromForm

  async function signIn() {
    return $uid || signInAnonymously($auth)
  }
  async function createAuctionHandler() {
    await signIn()
    database.setIndexSize(parseInt(numberOfBidders))
    database.listenForPin()
  }
  async function joinAuctionHandler() {
    await signIn()
    const intPin = parseInt(pinFromForm)
    pin.set(intPin)
    database.setIndexPin(intPin)
  }
</script>

{#if form?.success}
  <p>Successfully logged in! Welcome back, ${data}</p>
{/if}

{#if $uid}
  <Database bind:this={database} uid={$uid} />
{/if}
<div class="main">
  <h3>One of you, create an auction</h3>
  <form
    id="create-form"
    method="POST"
    action="?/register"
    on:submit|preventDefault={signIn}
  >
    <label for="bidder-number">Choose how many bidders: </label>
    <select
      name="bidder-number"
      form="create-form"
      bind:value={numberOfBidders}
    >
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4" selected>4</option>
      <option value="5">5</option>
      <option value="6">6</option>
    </select>
    <button type="submit" disabled={$loading}>Create Auction</button>
  </form>

  <h3>The rest of you, join that auction:</h3>
  <form id="join-form" method="POST" action="?/login" on:submit={signIn}>
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
