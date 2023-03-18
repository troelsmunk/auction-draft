<script>
  import { getDatabase, onValue, ref, remove, set } from "firebase/database"
  import { onMount } from "svelte"
  export let uid
  let indexPinRef, indexSizeRef

  onMount(() => {
    const db = getDatabase()
    indexPinRef = ref(db, `index/${uid}/pin`)
    indexSizeRef = ref(db, `index/${uid}/auctionSize`)
  })

  export function listenForPin() {
    const unsub = onValue(indexPinRef, (snap) => {
      if (snap.exists()) {
        pin.set(snap.val())
        unsub()
      }
    })
  }

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
