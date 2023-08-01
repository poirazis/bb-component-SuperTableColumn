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

  onMount(() => searchInput?.focus())

  $: dispatch("filter", { value: value } )
  
</script>

<div class="searchControl">
    <input class="inline-edit"
    bind:this={searchInput} 
    on:keyup={({ target: { value } }) => debounce(value)} 
    type="search" placeholder="Search" name="search" autocomplete="off"
  >
</div>

<style>
  .searchControl {
    flex-grow: 1;
    min-width: 100px;
    display: flex;
    align-items: center;
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));

  }

  input.inline-edit {
    box-sizing: border-box;
    outline: none;
    border: none;
    background: none;
    height: 100%;
    width: 100%;
    color: inherit;
    background-color: transparent;
  }
</style>