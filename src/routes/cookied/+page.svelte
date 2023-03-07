<script>
</script>

<!-- TODO: Add auction-joining from elsewhere -->

<h3>One of you, create an auction</h3>
<form id="create-form" method="POST" action="?/create">
  <label for="auction-size">Choose how many bidders: </label>
  <select name="auction-size" form="create-form">
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4" selected>4</option>
    <option value="5">5</option>
    <option value="6">6</option>
  </select>
  <button type="submit">Create Auction</button>
</form>
