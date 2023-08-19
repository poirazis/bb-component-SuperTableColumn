<script>
  import SuperTableHeaderFilterOptions from './SuperTableHeaderFilterOptions.svelte';
  import { clickOutsideAction } from 'svelte-legos';

  import { createEventDispatcher } from "svelte";

	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
	import { dataFilters } from '@budibase/shared-core';

  import SuperColumnHeaderSearchString from "./SuperColumnHeaderSearchString.svelte";
  import SuperColumnHeaderSearchBoolean from "./SuperColumnHeaderSearchBoolean.svelte";
  import SuperColumnHeaderSearchLink from "./SuperColumnHeaderSearchLink.svelte";

  import CellOptions from "../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellOptions.svelte"
  import CellDatetime from '../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellDatetime.svelte';
  import CellNumber from '../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellNumber.svelte';

  const dispatch = createEventDispatcher();

  // The FSM state of the Column
  export let state;
	export let fieldSchema;
  export let filtering;
  export let sorting;

  let filteredValue;

	const defaultOperatorMap = {
		 "string" : "fuzzy",
		 "array" : "contains",
		 "options" : "equal",
		 "datetime" : "rangeLow",
     "boolean" : "equal",
     "number" : "equal"
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

</script>

<div 
  class="spectrum-Table-headCell" 
  style:border-left={state == "Entering" || state == "Filtered" ? "2px solid #63CCCA" : null}
  >

  {#if state === "Idle" || state === "Ascending" || state === "Descending" }

		{#if filtering}
			<div class="actionIcon">
				<Icon on:click={() => dispatch("showFilter")} size="XS" hoverable name="FilterAdd" />
			</div>
		{/if}

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="headerLabel" style:padding-left={ !filtering ? "var(--super-table-cell-padding)" : null }>
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
      <SuperColumnHeaderSearchString
        on:filter={ (e) => applyFilter((e.detail)) }
      />
    {:else if fieldSchema.type  === "array" }
      <CellOptions
        on:change={(e) => { filteredValue = e.detail.value } }
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
    {:else if fieldSchema.type  === "number" }
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
      <SuperColumnHeaderSearchBoolean 
        on:filter={ (e) => applyFilter((e.detail)) }
      />
    {:else if fieldSchema.type  === "link" }
      <SuperColumnHeaderSearchLink 
        on:filter={ (e) => applyFilter((e.detail)) }
      />
    {/if}

    <div class="actionIcon close">
      <Icon on:click={ () => dispatch("clearFilter") } size="XS" hoverable name="Close"/>
    </div>
  {/if}
</div>

<style>
  .spectrum-Table-headCell {
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    align-items: stretch;
    height: 2.5rem;
    padding: unset;
    border-bottom: 1px solid var(--spectrum-alias-border-color-mid);
  }

  .headerLabel {
    flex: 1 0 auto;
    min-width: 0;
    display: flex;
    align-items: stretch;
    color: var(
      --spectrum-table-header-text-color,
      var(--spectrum-alias-label-text-color)
    );
    padding-right: var(--super-table-cell-padding);
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
    min-width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close {
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }
</style>
