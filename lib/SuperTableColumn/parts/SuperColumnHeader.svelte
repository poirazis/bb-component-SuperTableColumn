<script>
	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
	import { dataFilters } from '@budibase/shared-core';
  import { clickOutsideAction } from "svelte-legos";

  import SuperTableHeaderFilterOptions from './SuperTableHeaderFilterOptions.svelte';

  import CellOptions from "../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellOptions.svelte"
  import CellDatetime from '../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellDatetime.svelte';
  import CellNumber from '../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellNumber.svelte';
  import CellString from '../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellString.svelte';
  import CellBoolean from "../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellBoolean.svelte";

  export let columnState;
  export let enrichedColumnOptions
  export let filterValue
  export let filterOperator
  export let width

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

	let filteringOperators = dataFilters.getValidOperatorsForType(enrichedColumnOptions.schema.type);
	let defaultOperator = defaultOperatorMap[enrichedColumnOptions.schema.type];
  $: filterOperator = defaultOperator

  const handleClickOutside = () => {
    if ( $columnState == "Entering") 
      columnState.cancel();
  }

</script>

<div 
  class="spectrum-Table-headCell" 
  class:enterting={ $columnState == "Entering" } 
  class:filtered={ $columnState == "Filtered" } 
  use:clickOutsideAction
  on:clickoutside={handleClickOutside}
 >

  {#if $columnState === "Idle" || $columnState === "Ascending" || $columnState === "Descending" }

		{#if enrichedColumnOptions.canFilter }
			<div class="actionIcon">
				<Icon on:click={columnState.filter} size="XS" hoverable name="Filter" color={ "var(--spectrum-global-color-gray-600)" } />
			</div>
		{/if}

		<!-- svelte-ignore a11y-click-events-have-key-events -->
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
  
  {:else}

    <SuperTableHeaderFilterOptions 
      bind:filterOperator 
      {filteringOperators} 
      active={$columnState == "Filtered"}
    />

    {#if enrichedColumnOptions.schema.type == "string" }
      <CellString 
        inEdit
        bind:value={filterValue}
        debounced={800}
        editable
        {width}
        placeholder={"Search..."}
      />
    {:else if enrichedColumnOptions.schema.type == "formula" }
      <CellString 
        bind:value={filterValue}
        inEdit
        editable
        padded = {false}
        fieldSchema = {enrichedColumnOptions.schema}
      />
    {:else if enrichedColumnOptions.schema.type  === "array" }
      <CellOptions
        bind:value={filterValue}
        inEdit
        multi
        editable={true}
        fieldSchema = {enrichedColumnOptions.schema}
      />
    {:else if enrichedColumnOptions.schema.type  === "options" }
      <CellOptions
        on:change={(e) => { filterValue = e.detail.value.length > 0 ? e.detail.value[0] : null }}
        inEdit
        value={ filterValue }
        editable={true}
        fieldSchema = {enrichedColumnOptions.schema}
      />
    {:else if ( enrichedColumnOptions.schema.type == "number" || enrichedColumnOptions.schema.type == "bigint" )}
      <CellNumber
        bind:value={ filterValue }
        inEdit
        fieldSchema = {enrichedColumnOptions.schema}
      />
    {:else if enrichedColumnOptions.schema.type  === "datetime" }
      <CellDatetime
        inEdit
        value = { new Date() }
        on:change={(e) => { filterValue = e.detail.value }}
      />
    {:else if enrichedColumnOptions.schema.type  === "boolean" }
      <CellBoolean
        on:change={(e) => { filterValue = e.detail.value }}
        inEdit
        value={ filterValue }
        fieldSchema = {enrichedColumnOptions.schema}
      />
    {/if}

    <div class="actionIcon">
      <Icon on:click={ columnState.cancel } size="XS" hoverable name="Close"/>
    </div>
  {/if}
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
  }
  .enterting {
    gap: 0rem;
    border: 1px solid var(--spectrum-global-color-gray-300);
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-100));
  }
  .filtered {
    gap: 0rem;
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-100));
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
</style>
