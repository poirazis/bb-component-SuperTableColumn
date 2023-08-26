<script>
  import { createEventDispatcher } from "svelte";
  import clickOutside from "../../../node_modules/@budibase/bbui/src/Actions/click_outside"

	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
	import { dataFilters } from '@budibase/shared-core';

  import SuperTableHeaderFilterOptions from './SuperTableHeaderFilterOptions.svelte';

  import CellOptions from "../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellOptions.svelte"
  import CellDatetime from '../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellDatetime.svelte';
  import CellNumber from '../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellNumber.svelte';
  import CellString from '../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellString.svelte';
  import CellBoolean from "../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellBoolean.svelte";

  const dispatch = createEventDispatcher();

  // The FSM state of the Column
  export let state;
	export let fieldSchema;
  export let filtering;
  export let sorting;

  let filteredValue;

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

	let filteringOperators = dataFilters.getValidOperatorsForType(fieldSchema.type);
	let defaultOperator = defaultOperatorMap[fieldSchema.type];
  let filteringOperator = defaultOperator

  function applyFilter ( filter ) {
    filteredValue = filter.value
  }

  $: dispatch("applyFilter", { value: filteredValue , operator: filteringOperator } )

  function handleClickOutside () {
    if ( state === "Entering" ) dispatch("clearFilter")
  }

  function handleKeyboard (e) {
    if (e.key == "Escape") 
      dispatch("clearFilter")
  }
</script>

<div 
  class="spectrum-Table-headCell" 
  class:enterting={ state == "Entering" } 
  class:filtered={ state == "Filtered" } 
  on:keydown={handleKeyboard}
  use:clickOutside={ handleClickOutside } >

  {#if state === "Idle" || state === "Ascending" || state === "Descending" }

		{#if filtering}
			<div class="actionIcon">
				<Icon on:click={() => dispatch("showFilter")} size="XS" hoverable name="Filter" color={ "var(--spectrum-global-color-gray-700)" } />
			</div>
		{/if}

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="headerLabel" >
			<div class="innerText" class:sortable={sorting} on:click={() => { if (sorting) dispatch("sort") } }>
         <slot />
      </div>
		</div>

    {#if state !== "Idle" }
      <div class="actionIcon sort">
        <Icon size="XS" name= { state === "Descending" ? "SortOrderDown" : "SortOrderUp"}/>
      </div>
    {/if}
  
  {:else}

    <SuperTableHeaderFilterOptions 
      bind:filteringOperator 
      {filteringOperators} 
      active={state == "Filtered"}
    />

    {#if fieldSchema.type == "string" }
      <CellString 
        on:change={ (e) => { filteredValue = e.detail.value; } }
        inEdit
        value = { filteredValue }
        editable
        padded = {false}
        {fieldSchema}
      />
    {:else if fieldSchema.type == "formula" }
      <CellString 
        on:change={ (e) => { filteredValue = e.detail.value; } }
        inEdit
        value = { filteredValue }
        editable
        padded = {false}
        {fieldSchema}
      />
    {:else if fieldSchema.type  === "array" }
      <CellOptions
        on:change={ (e) => { filteredValue = e.detail.value } }
        inEdit
        value={ filteredValue }
        multi
        editable={true}
        {fieldSchema}
      />
    {:else if fieldSchema.type  === "options" }
      <CellOptions
        on:change={(e) => { filteredValue = e.detail.value.length > 0 ? e.detail.value[0] : null }}
        inEdit
        value={ filteredValue }
        editable={true}
        {fieldSchema}
      />
    {:else if ( fieldSchema.type == "number" || fieldSchema.type == "bigint" )}
      <CellNumber
        on:change={(e) => { filteredValue = Number(e.detail.value) }}
        inEdit
        value={ filteredValue }
        {fieldSchema}
      />
    {:else if fieldSchema.type  === "datetime" }
      <CellDatetime
        inEdit
        value = { new Date() }
        on:change={(e) => { filteredValue = e.detail.value }}
      />
    {:else if fieldSchema.type  === "boolean" }
      <CellBoolean
        on:change={(e) => { filteredValue = e.detail.value }}
        inEdit
        value={ filteredValue }
        {fieldSchema}
      />
    {/if}

    <div class="actionIcon close">
      <Icon on:click={ () => dispatch("clearFilter") } size="XS" hoverable name="Close"/>
    </div>
  {/if}
</div>

<style>
  .spectrum-Table-headCell {
    flex: auto;
    display: flex;
    align-items: stretch;
    height: 2.5rem;
    gap: 0.5rem;
    padding: unset;
    padding-right: var(--super-table-cell-padding);
    padding-left: var(--super-table-cell-padding);
    border-bottom: 1px solid var(--spectrum-alias-border-color-mid);
    transition: all 130ms ease-in-out;
  }
  .enterting {
    border-bottom: 1px solid rgba( 50, 205 , 50, 0.5 );
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }
  .filtered {
    border-bottom: 1px solid rgba( 50, 205 , 50, 0.85 );
    filter: brightness(125%);
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }

  .headerLabel {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
    color: var(
      --spectrum-table-header-text-color,
      var(--spectrum-alias-label-text-color)
    );
  }

  .innerText {
    flex: auto;
    display: flex;
    justify-content: var(--super-column-alignment);
    align-items: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
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

  .close {
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }
</style>
