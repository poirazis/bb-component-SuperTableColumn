<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  
  const dispatch = createEventDispatcher();
  export let value
  
  let searchInput
  let timer

	const debounce = v => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			value = v;
		}, 500);
	}

  function handleClearMarkClick ()
  {
    if (value == "") 
       dispatch("closeMe")
    else {
      searchInput.value = ""; 
      value = "";  
      searchInput.focus();
    }
  }

  onMount(() => searchInput?.focus())
</script>

<div in:fade class="inputWrapper"> 
  <input
    bind:this={searchInput} 
    on:keyup={({ target: { value } }) => debounce(value)} 
    class="spectrum-Textfield-input"
    type="search" placeholder="Search" name="search"  autocomplete="off"
  >
  <button class="clearButton" on:click={handleClearMarkClick}> 
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
      <g id="CrossSize200">
        <rect id="Frame" width="10" height="10" fill="red" opacity="0"/>
        <path d="M6.28925,5,9.21191,2.07715A.9115.9115,0,1,0,7.92285.78809L5.00024,3.71088,2.07764.78809A.91151.91151,0,0,0,.78857,2.07715L3.71124,5,.78857,7.92285A.91151.91151,0,0,0,2.07764,9.21191l2.9226-2.92279L7.92285,9.21191A.9115.9115,0,0,0,9.21191,7.92285Z"/>
      </g>
    </svg>    
  </button>
</div>

<style>
  .inputWrapper {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-items: stretch;
    margin-top: -8px;
    margin-bottom: -8px;
  }

  .clearButton {
    border: none;
    background-color: transparent;
    margin-left: -24px;
    fill:  var(--spectrum-table-cell-text-color, var(--spectrum-alias-text-color));
  }

  .spectrum-Textfield-input {
    font-size: 14px;
    line-height: 14px;
    padding: 2px;
    padding-left: 12px;
    border-bottom: 1px solid var(--spectrum-alias-border-color-mid);
    border-radius: 2px;
  }
  
  .spectrum-Textfield-input:focus {
    border-bottom: 1px solid var(--primaryColor);
  }
</style>