<script>
  import { currentRound, firebaseApp } from "$lib/stores"
  import { getDatabase, onValue, ref } from "firebase/database"
  import Firebase from "$lib/Firebase.svelte"
  import { onMount } from "svelte"
  import { page } from "$app/stores"

  onMount(() => {
    const roundRef = ref(
      getDatabase($firebaseApp),
      `auctions/${$page.params.pin}/round`
    )
    onValue(roundRef, (snap) => {
      currentRound.set(snap.val())
    })
  })
</script>

<Firebase />

<slot />
