<script>
  import { db } from "$lib/stores"
  import { ref, set } from "@firebase/database"

  /** @type {number} */
  let tal
  function send() {
    return set(ref($db, "tal"), tal)
  }
</script>

<p>Jeg kan skrive alt muligt på nettet</p>

<form>
  <input bind:value={tal} type="number" />
  <input type="submit" on:submit={send} />
</form>
