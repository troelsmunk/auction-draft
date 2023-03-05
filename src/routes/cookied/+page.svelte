<script>
  import { auth, userIdToken } from "$lib/stores"
  import { signInAnonymously } from "firebase/auth"
  import { onMount } from "svelte"

  onMount(() => {
    signInAnonymously($auth)
  })
</script>

<!-- TODO: Implement auction-joining -->

<h3>One of you, create an auction</h3>
<form id="create-form" method="POST" action="?/create">
  <input hidden="true" value={$userIdToken} name="user-id-token" />
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
