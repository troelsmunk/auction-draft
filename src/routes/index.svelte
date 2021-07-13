<script>
  import Firebase from "./_Firebase.svelte"
  /**
   * @type {Firebase}
   */
  let firebaseComponent
  function clicked() {
    firebaseComponent.initialize()
  }
</script>

<p>Jeg kan skrive alt muligt på nettet</p>
<button on:click|once={clicked}>Cookies</button>

<Firebase bind:this={firebaseComponent} />
