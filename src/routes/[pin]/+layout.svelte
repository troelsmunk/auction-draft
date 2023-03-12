<script>
  import { firebaseApp } from "$lib/stores"
  import { getDatabase, onValue, ref } from "firebase/database"
  import Firebase from "$lib/Firebase.svelte"
  import { onMount } from "svelte"

  /** @type {import('./$types').LayoutData} */
  export let data

  console.log("pin/+layout <script>")

  let currentRound
  onMount(() => {
    console.log("pin/+layout onMount")
    const roundRef = ref(
      getDatabase($firebaseApp),
      `auctions/${data.pin}/round`
    )
    onValue(roundRef, (snap) => {
      currentRound = snap.val()
    })
  })
</script>

<Firebase />

<slot />
