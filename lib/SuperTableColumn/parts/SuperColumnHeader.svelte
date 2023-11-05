<script>
	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
  import Popover  from "../../../node_modules/@budibase/bbui/src/Popover/Popover.svelte"
	import { dataFilters } from '@budibase/shared-core/';
  import { clickOutsideAction } from "svelte-legos";
  import { SuperCell } from "../../../bb-component-SuperTableCell/lib/SuperTableCell/index.js";

  export let columnState;
  export let columnOptions

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
  let cellState
  let filterValue

	let filteringOperators = dataFilters.getValidOperatorsForType(columnOptions?.schema?.type);
	let defaultOperator = defaultOperatorMap[columnOptions?.schema?.type];
  $: filterOperator = defaultOperator

  const handleValueChange = ( e ) => {
    filterValue = e.detail
    if ( filterValue != undefined && filterValue != "" && filterValue.length != [] ) {
      columnState.filter( buildFilter( filterOperator, filterValue ) )
    } else {
      columnState.clear()
    }
  }

  const buildFilter = ( operator , value ) => {
    return {
            field: columnOptions.name,
            operator: operator,
            value: columnOptions.schema.type == "number" ? Number(value) : value,
            valueType: "Value",
          }
  }

  const showFilters = ( e ) => {
    filterValue = undefined
    columnState.filter();
  }

  const handleClickOutside = ( e ) => {
    if ( $columnState == "Entering" && $cellState != "EditingWithEditor" )
      columnState.cancel();
  }

  const handleKeyboard = ( e ) => {
    if (e.key == "Enter") {
     columnState.filter ( filterOperator, filterValue )
    }
    if (e.key == "Escape") {
      columnState.cancel();
    }
  }

</script>

{#if columnOptions.showHeader}
<!-- svelte-ignore a11y-click-events-have-key-events -->
  <div 
    bind:this={headerAnchor}
    class="spectrum-Table-headCell" 
    class:enterting={ $columnState == "Entering" } 
    class:filtered={ $columnState == "Filtered" }
    on:keydown={handleKeyboard}
    use:clickOutsideAction
    on:clickoutside={ () => { 
      if (($columnState == "Entering" || $columnState == "Filtered") && !showFilteringOptions) 
        setTimeout(handleClickOutside, 10) 
    }}
  >

    {#if $columnState == "Idle" || $columnState == "Ascending" || $columnState == "Descending" }

      {#if columnOptions.canFilter }
        <div class="actionIcon">
          <Icon on:click={showFilters} size="XS" hoverable name="Filter" color={ "var(--spectrum-global-color-gray-600)" } />
        </div>
      {/if}


      <div class="headerLabel" style:justify-content={columnOptions?.headerAlign} >
        <div class="innerText" class:sortable={columnOptions.canSort} on:click={columnState.sort}>
          {columnOptions.displayName}
        </div>
      </div>

      {#if $columnState !== "Idle" }
        <div class="actionIcon sort">
          <Icon size="XS" name= { $columnState === "Descending" ? "SortOrderDown" : "SortOrderUp"}/>
        </div>
      {/if}
    
    {:else if $columnState == "Entering" || $columnState == "Filtered" }
      <div class="actionIcon" style:padding-right={"0.5rem"}>
        <Icon size="XS" hoverable name="Settings" color={ $columnState == "Filtered" ? "var(--spectrum-global-color-blue-500)" : null }  on:click={ () => ( showFilteringOptions = true )} />
      </div>

      <SuperCell
        bind:cellState
        value={filterValue}
        fieldSchema={columnOptions.schema}
        initialState="Editing"
        lockState
        unstyled
        on:change={handleValueChange}
      />

      <div class="actionIcon">
        <Icon size="XS" hoverable name="Close" color={ "var(--spectrum-global-color-red-500)" }  on:click={ columnState.cancel } />
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
            on:click|stopPropagation={() => { 
              filterOperator = option.value; 
              showFilteringOptions = false; 
              columnState.filter( buildFilter( filterOperator, filterValue ) )
            } }
          >
              <span class="spectrum-Menu-itemLabel">{option.label}</span>
          </li>
        {/each}
      </ul>
    </Popover>
  </div>
{/if}

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
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-100));
  }

  .headerLabel {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
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

  .selected {
    color: var(--primaryColor);
    background-color: var(--spectrum-global-color-gray-75);
  }
</style>
