<script>
  import { onMount, createEventDispatcher } from "svelte";
  
  const dispatch = createEventDispatcher()
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
    value = null;
    dispatch("closeMe")
  }

  onMount(() => searchInput?.focus())
</script>
<div class="searchControl"> 
  <input class="inline-edit"
    bind:this={searchInput} 
    on:keyup={({ target: { value } }) => debounce(value)} 
    type="search" placeholder="Search" name="search" autocomplete="off"
  >
  <button class="clearButton" on:click={handleClearMarkClick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
      <g id="CrossSize300">
        <rect id="Frame" width="10" height="10" fill="red" opacity="0"/>
        <path d="M7.34277,6l3.39649-3.39648a.94949.94949,0,1,0-1.34375-1.3418L6.00018,4.65741,2.60449,1.26172a.94914.94914,0,1,0-1.34277,1.3418L4.65778,6,1.26172,9.39648a.94914.94914,0,1,0,1.34277,1.3418L6.00018,7.34259l3.39533,3.39569a.94949.94949,0,1,0,1.34375-1.3418Z"/>
      </g>
    </svg>
  </button>
</div>

<style>
  .searchControl {
    flex: auto;
  }
  input.inline-edit {
    box-sizing: border-box;
    padding-left: 12px;
    padding-right: 28px;
    outline: none;
    border: none;
    background: none;
    color: inherit;
    height: 100%;
    width: 100%;
    border: 2px solid var(--spectrum-alias-border-color-mid);
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }
  .clearButton {
    background-color: transparent;
    border: none;
    margin-left: -28px;
    cursor: pointer;
    fill:  var(--spectrum-table-cell-text-color, var(--spectrum-alias-text-color));
  }
  .clearButton:hover {
    background-color: transparent;
    fill: var(--spectrum-global-color-red-500);
  }
</style>