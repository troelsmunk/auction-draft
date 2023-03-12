<script>
  import { currentRound, firebaseApp } from "$lib/stores"
  import { getDatabase, onValue, ref } from "firebase/database"
  import Firebase from "$lib/Firebase.svelte"
  import { onMount } from "svelte"

  /** @type {import('./$types').LayoutData} */
  export let data

  console.log("pin/+layout <script>")

  onMount(() => {
    console.log("pin/+layout onMount")
    const roundRef = ref(
      getDatabase($firebaseApp),
      `auctions/${data.pin}/round`
    )
    onValue(roundRef, (snap) => {
      console.log("setting currentRound to :" + snap.val())
      currentRound.set(snap.val())
    })
  })
</script>

<Firebase />

<slot />
