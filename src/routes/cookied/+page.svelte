<script>
  import { auth, uid } from "$lib/stores"
  import { signInAnonymously } from "firebase/auth"
  import { onMount } from "svelte"

  let token

  onMount(() => {
    signInAnonymously($auth).then(async (userCredential) => {
      token = await userCredential.user.getIdToken(true)
      uid.set(userCredential.user.uid)
    })
  })
</script>

<h3>One of you, create an auction</h3>
<form id="create-form" method="POST" action="?/create">
  <input hidden="true" bind:value={token} name="token" />
  <label for="bidder-number">Choose how many bidders: </label>
  <select name="bidder-number" form="create-form">
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4" selected>4</option>
    <option value="5">5</option>
    <option value="6">6</option>
  </select>
  <button type="submit">Create Auction</button>
</form>
