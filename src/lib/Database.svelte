<script>
  import { getDatabase, onValue, ref, remove, set } from "@firebase/database"
  import { onMount } from "svelte"
  import { pin } from "./stores"
  export let uid
  let indexPinRef, indexSizeRef

  onMount(() => {
    const db = getDatabase()
    indexPinRef = ref(db, `index/${uid}/pin`)
    indexSizeRef = ref(db, `index/${uid}/auctionSize`)
    onValue(indexPinRef, (snap) => {
      console.log("This won't show on mount sadly...")
      pin.set(snap.val())
    })
  })

  export function clearIndex() {
    remove(indexPinRef)
    remove(indexSizeRef)
  }
  export function setIndexPin(pin) {
    set(indexPinRef, pin)
  }
  export function setIndexSize(size) {
    set(indexSizeRef, size)
  }
</script>
