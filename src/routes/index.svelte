<script>
  import { auth, uid } from "$lib/stores"
  import { signInAnonymously } from "firebase/auth"
  import Database from "$lib/Database.svelte"

  let database
  let numberOfBidders
  let pin

  async function signIn() {
    if ($uid) return
    const cred = await signInAnonymously($auth)
    uid.set(cred.user.uid)
  }
  async function createAuctionHandler() {
    await signIn()
    database.setIndexSize(parseInt(numberOfBidders))
  }
  async function joinAuctionHandler() {
    await signIn()
    database.setIndexPin(parseInt(pin))
  }
</script>

{#if $uid}
  <Database bind:this={database} uid={$uid} />
{/if}

<form id="create-form" on:submit|preventDefault={createAuctionHandler}>
  <label for="bidder-number">Choose how many bidders: </label>
  <select name="bidder-number" form="create-form" bind:value={numberOfBidders}>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4" selected>4</option>
    <option value="5">5</option>
    <option value="6">6</option>
  </select>
  <input type="submit" value="Create" />
</form>

<form id="join-form" on:submit|preventDefault={joinAuctionHandler}>
  <label for="pin">Write PIN:</label>
  <input
    bind:value={pin}
    name="pin"
    type="text"
    inputmode="numeric"
    pattern="[0-9][0-9][0-9][0-9]"
  />
  <input type="submit" value="Join" />
</form>
