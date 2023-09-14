<script>
	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
  import Popover from "../../../node_modules/@budibase/bbui/src/Popover/Popover.svelte"
	import { dataFilters } from '@budibase/shared-core';
  import SuperCell from "../../../bb-component-SuperTableCell/lib/SuperTableCell/SuperCell.svelte";

  export let columnState;
  export let enrichedColumnOptions
  export let filterValue = []
  export let filterOperator

	const defaultOperatorMap = {
		 "string" : "fuzzy",
		 "formula" : "fuzzy",
		 "array" : "contains",
		 "options" : "equal",
		 "datetime" : "rangeLow",
     "boolean" : "equal",
     "number" : "equal",
     "bigint" : "equal",
	}

  let headerAnchor 
  let showFilteringOptions = false  

	let filteringOperators = dataFilters.getValidOperatorsForType(enrichedColumnOptions.schema.type);
	let defaultOperator = defaultOperatorMap[enrichedColumnOptions.schema.type];
  $: filterOperator = defaultOperator

  const handleKeyboard = ( e ) => {

    if (e.key == "Enter") {
     columnState.filter ( filterOperator, filterValue )
    }
    if (e.key == "Escape") {
      columnState.cancel();
    }
  }

  $: console.log ("Column State in Header ", $columnState)

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
  bind:this={headerAnchor}
  class="spectrum-Table-headCell" 
  class:enterting={ $columnState == "Entering" } 
  class:filtered={ $columnState == "Filtered" }
  on:keydown={handleKeyboard}
 >

  {#if $columnState == "Idle" || $columnState == "Ascending" || $columnState == "Descending" }

		{#if enrichedColumnOptions.canFilter }
			<div class="actionIcon">
				<Icon on:click={columnState.filter} size="XS" hoverable name="Filter" color={ "var(--spectrum-global-color-gray-600)" } />
			</div>
		{/if}


		<div class="headerLabel" >
			<div class="innerText" class:sortable={enrichedColumnOptions.canSort} on:click={columnState.sort}>
         {enrichedColumnOptions.displayName}
      </div>
		</div>

    {#if $columnState !== "Idle" }
      <div class="actionIcon sort">
        <Icon size="XS" name= { $columnState === "Descending" ? "SortOrderDown" : "SortOrderUp"}/>
      </div>
    {/if}
  
  {:else if $columnState == "Entering" || $columnState == "Filtered" }
    <SuperCell
      fieldSchema={enrichedColumnOptions.schema}
      initialState="Editing"
      lockState
      unstyled
      on:change={ ( e ) => 
      { 
        console.log("Super Cell Change", e.detail )
        columnState.filter(defaultOperator, e.detail )
      }}
    />

    <div class="actionIcon">
      <Icon size="M" hoverable name="Close" color={ "var(--spectrum-global-color-red-500)" }  on:click={ columnState.cancel } />
    </div>
  {:else if $columnState == "Loading" }
    <p> ... </p>
  {/if}


  <Popover anchor={headerAnchor} align="left" open={showFilteringOptions} on:close={ () => { showFilteringOptions = false; }}>
    <ul class="spectrum-Menu" role="menu">
      {#each filteringOperators as option }
        <li class="spectrum-Menu-item" 
          class:selected={ option.value == filterOperator }
          role="menuitem" tabindex="0" 
          on:click|stopPropagation={() => { filterOperator = option.value; open = false; } }
        >
            <span class="spectrum-Menu-itemLabel">{option.label}</span>
        </li>
      {/each}
    </ul>
  </Popover>
</div>

<style>
  .spectrum-Table-headCell {
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    height: 2.5rem;
    gap: 0.5rem;
    padding: unset;
    padding-right: var(--super-table-cell-padding);
    padding-left: var(--super-table-cell-padding);
    border: 1px solid transparent;
    border-bottom: 1px solid var(--spectrum-alias-border-color-mid);
    background-color: var(--super-table-header-bg-color);
  }
  .enterting {
    gap: 0.5rem;
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }
  .filtered {
    gap: 0rem;
    color: var(--spectrum-global-color-gray-800);
    border: 1px solid var(--spectrum-global-color-gray-500);
    font-weight: 700;
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }

  .headerLabel {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: stretch;
    min-width: 0;
  }
  .innerText {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: var(--super-table-header-color);
  }

  .sortable {
    cursor: pointer;
  }
  .sortable:hover {
    filter: brightness(120%);
  }
  .actionIcon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
