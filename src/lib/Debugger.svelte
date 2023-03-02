<script>
  import {
    auth,
    pin,
    uid,
    currentlyBidding,
    auctionSize,
    seat,
  } from "$lib/stores"
</script>

<div class="debugging">
  <table>
    <tbody>
      <tr>
        <td>UID:</td>
        <td class="debug-value">{$uid}</td>
      </tr>
      <tr>
        <td>PIN:</td>
        <td class="debug-value">{$pin}</td>
      </tr>
      <tr>
        <td>currentlyBidding:</td>
        <td class="debug-value">{$currentlyBidding}</td>
      </tr>
      <tr>
        <td>auctionSize:</td>
        <td class="debug-value">{$auctionSize}</td>
      </tr>
      <tr>
        <td>seat:</td>
        <td class="debug-value">{$seat}</td>
      </tr>
    </tbody>
  </table>
</div>

<style>
  .debugging {
    background-color: rgb(240, 240, 240);
  }
  .debug-value {
    font-weight: 600;
    color: rgb(250, 70, 4);
  }
</style>
