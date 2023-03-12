<script>
  import { firebaseApp } from "$lib/stores"
  import { getDatabase, onValue, ref } from "firebase/database"
  import Firebase from "$lib/Firebase.svelte"
  import { onMount } from "svelte"

  /** @type {import('./$types').LayoutData} */
  export let data
  let colors = ["purple", "yellow", "brown", "gray", "lightblue", "orange"]
  colors.length = data.size
  let currentRound
  console.log("round/+layout <script>")

  onMount(() => {
    console.log("round/+layout onMount")
    console.log("firebaseApp: " + $firebaseApp)
    console.log("getDatabase(firebaseApp): " + getDatabase($firebaseApp))
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

<h3>Scoreboard</h3>
<ul class="scoreboard">
  {#each colors as color, i}
    <li class="scoreboard-item" style:background-color={color}>
      {#if i + 1 == data.round % data.size}
        opener
      {/if}
      {data.scores[i]}
    </li>
  {/each}
</ul>

<slot />

<style>
  .scoreboard {
    display: flex;
    flex-direction: row;
    justify-content: space-around;

    padding: 0;
    margin: 0;
    list-style: none;
  }

  .scoreboard-item {
    padding: 5px;
    width: 200px;
    height: 50px;
    margin-top: 10px;
    line-height: 50px;
    color: black;
    font-weight: bold;
    font-size: 1em;
    text-align: center;
  }
</style>
