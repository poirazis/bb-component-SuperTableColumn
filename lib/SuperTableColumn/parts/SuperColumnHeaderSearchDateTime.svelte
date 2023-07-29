<script>
  import { onMount, createEventDispatcher } from "svelte";
  
  import ActionMenu from "../../../node_modules/@budibase/bbui/src/ActionMenu/ActionMenu.svelte"
  import Item from "../../../node_modules/@budibase/bbui/src/Menu/Item.svelte"
  import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
  import DatePicker from "../../../node_modules/@budibase/bbui/src/Form/Core/DatePicker.svelte"

  const dispatch = createEventDispatcher()
  
  export let value
  export let valueOptions
  export let defaultOperator
  export let filteringOperator
  export let filteringOperators
  
  let searchInput
  let timer
  
  let options = filteringOperators.map( v => v.label )
  filteringOperator = defaultOperator

	const debounce = v => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			value = v;
		}, 500);
	}

  function handleClearMarkClick ()
  {
    dispatch("closeMe")
  }

  onMount(() => searchInput?.focus())
</script>
<div class="searchControl">
  <ActionMenu>
    <div slot="control" class="control icon">
      <Icon size="S" hoverable name="FilterEdit" />
    </div>
    {#each options as option}
      <Item on:click={ () => ( filteringOperator = option ) }>
        {#if option === filteringOperator }
          <span class="selected"> {option} </span>
        {:else}
          {option}
        {/if}
      </Item>
    {/each}
  </ActionMenu>

  <DatePicker on:change={ ( e ) => value = e.detail }/>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="clearButton" on:click={handleClearMarkClick}>
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 12 12">
      <g id="CrossSize300">
        <rect id="Frame" width="10" height="10" fill="red" opacity="0"/>
        <path d="M7.34277,6l3.39649-3.39648a.94949.94949,0,1,0-1.34375-1.3418L6.00018,4.65741,2.60449,1.26172a.94914.94914,0,1,0-1.34277,1.3418L4.65778,6,1.26172,9.39648a.94914.94914,0,1,0,1.34277,1.3418L6.00018,7.34259l3.39533,3.39569a.94949.94949,0,1,0,1.34375-1.3418Z"/>
      </g>
    </svg>
  </div>

</div>

<style>

  .searchControl {
    flex: auto;
    display: flex;
    align-items: center;
  }
  .control {
    width: 32px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .selected {
    font-weight: 800;
    color: var(--primaryColor);
  }
  input.inline-edit {
    box-sizing: border-box;
    padding-left: 32px;
    padding-right: 32px;
    outline: none;
    border: none;
    background: none;
    height: 100%;
    width: 100%;
    color: inherit;
    margin-right: -32px;
    margin-left: -32px;
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }
  .clearButton {
    width: 32px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    fill:  var(--spectrum-table-cell-text-color, var(--spectrum-alias-text-color));
  }
  .clearButton:hover {
    background-color: transparent;
    fill: var(--spectrum-global-color-red-500);
  }
</style>