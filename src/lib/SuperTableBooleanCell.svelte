<script>
  export let inactiveColor = "var(--spectrum-global-color-red-400)"
  export let activeColor = "var(--spectrum-global-color-green-400)"
  export let accentColor = "var(--spectrum-global-color-gray-50)"
  export let isActive = false;
</script>


<div class="toggle">
  <div style="background: {isActive ? activeColor : inactiveColor};" class="toggle-button {isActive && 'toggle-button-active'}">
    <div style="background: {accentColor};" class="toggle-inner-circle {isActive && 'toggle-inner-circle-active'}">
    </div>
  </div>
</div>

<style>
  .toggle {
    display: flex;
    position: relative;
  }
  .toggle-button {
    width: 36px;
    height: 20px;
    border-radius: 30px;
    padding: 4px;
    transition: all 200ms ease-in-out;
  }
  .toggle-button > .toggle-inner-circle {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transition: all 200ms ease-in-out;
  }
  .toggle-inner-circle-active {
    margin-left: 16px;
  }
</style>