<script>
  import { currentRound, firebaseApp } from "$lib/stores"
  import { getDatabase, onValue, ref } from "firebase/database"
  import Firebase from "$lib/Firebase.svelte"
  import { onMount } from "svelte"

  /** @type {import('./$types').LayoutData} */
  export let data

  onMount(() => {
    const roundRef = ref(
      getDatabase($firebaseApp),
      `auctions/${data.pin}/round`
    )
    onValue(roundRef, (snap) => {
      currentRound.set(snap.val())
    })
  })
</script>

<Firebase />

<slot />
