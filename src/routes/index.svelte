<script>
  import { auth, pin, uid } from "$lib/stores"
  import { signInAnonymously } from "firebase/auth"
  import Database from "$lib/Database.svelte"

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
    bind:value={pinFromForm}
    name="pin"
    type="text"
    inputmode="numeric"
    pattern="[0-9][0-9][0-9][0-9]"
  />
  <input type="submit" value="Join" />
</form>
