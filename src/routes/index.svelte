<script>
  import { db } from "$lib/stores"
  import { ref, set, onValue } from "@firebase/database"
  let talRef
  let talFraDb = 0
  db.subscribe((value) => {
    console.log("db subscribed: ", value)
    if (!value) return
    talRef = ref(value, "tal")
    onValue(talRef, (snap) => {
      talFraDb = snap.val()
    })
  })
  /** @type {number} */
  let tal = 0
  function setTal() {
    return set(talRef, tal)
  }
</script>

<p>Jeg kan skrive alt muligt på nettet</p>
<form on:submit|preventDefault={setTal}>
  <input bind:value={tal} type="number" />
  <input type="submit" />
</form>

<p>
  Her er et tal fra databasen: {talFraDb}
</p>
