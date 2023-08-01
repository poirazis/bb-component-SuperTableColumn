<script>
  import SuperTableHeaderFilterOptions from './SuperTableHeaderFilterOptions.svelte';

  import { createEventDispatcher } from "svelte";

	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
	import { dataFilters } from "@budibase/shared-core";

	import SuperColumnHeaderSearchArray from "./SuperColumnHeaderSearchArray.svelte";
  import SuperColumnHeaderSearchString from "./SuperColumnHeaderSearchString.svelte";
	import SuperColumnHeaderSearchDateTime from "./SuperColumnHeaderSearchDateTime.svelte";
  import SuperColumnHeaderSearchBoolean from "./SuperColumnHeaderSearchBoolean.svelte";
  import SuperColumnHeaderSearchLink from "./SuperColumnHeaderSearchLink.svelte";

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
		 "datetime" : "rangeLow",
     "boolean" : "equal"
	}

	let filteringOperators = dataFilters.getValidOperatorsForType(fieldSchema.type);
	let defaultOperator = defaultOperatorMap[fieldSchema.type];
  let filteringOperator = defaultOperator

  function applyFilter ( filter ) {
    filteredValue = filter.value
  }

  $: dispatch("applyFilter", { value: filteredValue , operator: filteringOperator } )
</script>

<div class="spectrum-Table-headCell" style:border-bottom={state == "Entering" || state == "Filtered" ? "1px solid var(--primaryColor)" : null}>

  {#if state === "Idle"}

		{#if filtering}
			<div class="actionIcon">
				<Icon on:click={() => dispatch("showFilter")} size="XS" hoverable name="FilterAdd" />
			</div>
		{/if}

		  <!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			on:click={() => { if (sorting) dispatch("sort") } }
			class="headerLabel"
      style:padding-left={ !filtering ? "12px" : "0px"}
      style:padding-right={"12px"}
			class:sortable={sorting}
		>
			<div class="headerLabelText"><slot /></div>
		</div>

  {:else if state === "Ascending" || state === "Descending"}
		{#if filtering}
			<div class="actionIcon">
				<Icon on:click={() => dispatch("showFilter")} size="XS" hoverable name="FilterAdd" />
			</div>
		{/if}

		  <!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			on:click={() => { if (sorting) dispatch("sort") } }
			class="headerLabel"
			class:sortable={sorting}
		>
			<div class="headerLabelText"><slot /></div>
		</div>

    <div class="actionIcon sort">
			<Icon size="XS" hoverable name= { state === "Descending" ? "SortOrderDown" : "SortOrderUp"}/>
    </div>
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
      <SuperColumnHeaderSearchArray 
        valueOptions={fieldSchema.constraints.inclusion}
        on:filter={ (e) => applyFilter((e.detail)) }
      />
    {:else if fieldSchema.type  === "datetime" }
      <SuperColumnHeaderSearchDateTime 
        on:filter={ (e) => applyFilter((e.detail)) }
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
    flex-direction: column;
    justify-content: center;
    align-content: center;
    color: var(
      --spectrum-table-header-text-color,
      var(--spectrum-alias-label-text-color)
    );
  }

  .headerLabelText {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .sortable:hover {
    white-space: nowrap;
    filter: brightness(120%);
    cursor: pointer;
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
