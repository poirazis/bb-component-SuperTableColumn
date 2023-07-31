<script>
  import { createEventDispatcher } from "svelte";

	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
	import { dataFilters } from "@budibase/shared-core";

	import SuperColumnHeaderSearchArray from "./SuperColumnHeaderSearchArray.svelte";
  import SuperColumnHeaderSearchString from "./SuperColumnHeaderSearchString.svelte";
	import SuperColumnHeaderSearchDateTime from "./SuperColumnHeaderSearchDateTime.svelte";
  import SuperColumnHeaderSearchBoolean from "./SuperColumnHeaderSearchBoolean.svelte";

  const dispatch = createEventDispatcher();

	export let fieldSchema;
  export let filtering;
  export let sorting;
  export let resizable;
  export let filteredValue;
  export let filteringOperator;

  // The FSM state of the Column
  export let state;

  // When the header is resized, ßnotify the Parent Component to adjust accordingly
  export let flexBasis = "auto";

  // Column Resize Functionality
  export let isResizing = false;
  let startPos;
  let container;
  let initialWidth;

  function startResizing(event) {
    isResizing = true;
    startPos = event.clientX;
    initialWidth = container?.getBoundingClientRect().width;
  }

  function stopResizing() {
    if (isResizing) {
      isResizing = false;
      startPos = null;
      initialWidth = null;
    }
  }

  function resetResizing(event) {
    flexBasis = "auto";
  }

  function resize(event) {
    if (!isResizing) return;
    else {
      flexBasis = initialWidth + (event.clientX - startPos) + "px";
    }
  }

	const defaultOperatorMap = {
		 "string" : "fuzzy",
		 "array" : "contains",
		 "datetime" : "rangeLow",
     "boolean" : "equal"
	}

	$: filteringOperators = dataFilters.getValidOperatorsForType(fieldSchema.type);
	$: defaultOperator = defaultOperatorMap[fieldSchema.type];

  $: if (filteredValue) 
			{ dispatch("applyFilter", {
				value: filteredValue,
				operator: filteringOperator
				})
			};
</script>

<div class="spectrum-Table-headCell" style:border={state == "Entering" || state == "Filtered" ? "1px solid var(--primaryColor)" : null}>

  {#if state === "Idle"}

		{#if filtering}
			<div class="headerActions">
				<Icon on:click={() => dispatch("showFilter")} size="XS" hoverable name="FilterAdd" />
			</div>
		{/if}

		  <!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			on:click={() => { if (sorting) dispatch("sort") } }
			class="headerLabel"
			style:--header-label-cellpadding={filtering ? "0.5rem" : null}
			class:sortable={sorting}
		>
			<div class="headerLabelText"><slot /></div>
		</div>

  {:else if state === "Ascending" || state === "Descending"}
		{#if filtering}
			<div class="headerActions">
				<Icon on:click={() => dispatch("showFilter")} size="XS" hoverable name="FilterAdd" />
			</div>
		{/if}

		  <!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			on:click={() => { if (sorting) dispatch("sort") } }
			class="headerLabel"
			style:--header-label-cellpadding={filtering ? "0.5rem" : null}
			class:sortable={sorting}
		>
			<div class="headerLabelText"><slot /></div>
		</div>

    <div class="headerSort">
			<Icon size="XS" hoverable name= { state === "Descending" ? "SortOrderDown" : "SortOrderUp"}/>
    </div>
  {:else}
		{#if fieldSchema.type == "string" }
      <SuperColumnHeaderSearchString
        {filteringOperators}
        {defaultOperator}
        on:filter={ (e) => dispatch("applyFilter", { value: e.detail.value , operator: e.detail.operator } )}
        on:closeMe={ () => dispatch("clearFilter") }
      />
		{:else if fieldSchema.type  === "array" }
			<SuperColumnHeaderSearchArray 
				{filteringOperators}
				{defaultOperator}
				valueOptions={fieldSchema.constraints.inclusion}
        on:filter={ (e) => dispatch("applyFilter", { value: e.detail.value , operator: e.detail.operator } )}
				on:closeMe={() => dispatch("clearFilter")}
			/>
		{:else if fieldSchema.type  === "datetime" }
			<SuperColumnHeaderSearchDateTime 
				{filteringOperators}
				{defaultOperator}
        on:filter={ (e) => dispatch("applyFilter", { value: e.detail.value , operator: e.detail.operator } )}
				on:closeMe={() => dispatch("clearFilter")}
			/>
		{:else if fieldSchema.type  === "boolean" }
			<SuperColumnHeaderSearchBoolean 
				{filteringOperators}
				{defaultOperator}
        on:filter={ (e) => dispatch("applyFilter", { value: e.detail.value , operator: e.detail.operator } )}
				on:closeMe={() => dispatch("clearFilter")}
			/>
		{/if}
  {/if}
</div>

<style>
  .spectrum-Table-headCell {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    height: 2.5rem;
    padding: unset;
    border-bottom: 1px solid var(--spectrum-alias-border-color-mid);
  }

  .headerActions {
    width: calc(var(--super-table-cell-padding) + 12px);
    display: flex;
    background-color: transparent;
    align-items: center;
    justify-content: center;
    fill: var(
      --spectrum-table-header-text-color,
      var(--spectrum-alias-label-text-color)
    );
    transition: scale 130ms ease-in-out;
    padding-left: var(--super-table-cell-padding);
  }

  .headerActions:hover {
    filter: brightness(120%);
    cursor: pointer;
  }
  .headerLabel {
    flex: auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    color: var(
      --spectrum-table-header-text-color,
      var(--spectrum-alias-label-text-color)
    );
    padding-left: var(
      --header-label-cellpadding,
      var(--super-table-cell-padding)
    );
    padding-right: var(
      --header-label-cellpadding,
      var(--super-table-cell-padding)
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

  .headerSort {
    width: calc(var(--super-table-cell-padding) + 10px);
    display: flex;
    align-items: center;
    padding-right: var(--super-table-cell-padding);
  }

  .sortIndicator {
    max-height: 10px;
    transition: tranform 300ms ease-in-out;
    transform: rotate(var(--indicatorRotation));
    fill: var(
      --spectrum-table-header-text-color,
      var(--spectrum-alias-label-text-color)
    );
  }
</style>
