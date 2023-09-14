<script>
	import { getContext , createEventDispatcher } from "svelte";
	import Popover from "../../../node_modules/@budibase/bbui/src/Popover/Popover.svelte";
	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
	import { SuperTableCell } from "../../../bb-component-SuperTableCell/lib/SuperTableCell/index.js";
	import CellSkeleton from "../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellSkeleton.svelte";
	import { elementSizeStore } from "svelte-legos";

	const dispatch = createEventDispatcher();
	const { Provider } = getContext("sdk")
	const tableOptionStore = getContext("tableOptionStore");
	const tableStateStore = getContext("tableStateStore");

	export let row
	export let index
	export let enrichedColumnOptions
	export let isSelected
	export let isHovered
	export let isLoading

	$: popup = enrichedColumnOptions?.hasChildren && enrichedColumnOptions?.popup
	$: valueTemplate = enrichedColumnOptions?.template
	$: fieldSchema = enrichedColumnOptions?.schema ?? {}
	$: height = $tableStateStore?.rowHeights[index]
	$: minHeight = $tableOptionStore?.rowHeight
	$: rowKey = row?.rowKey
	$: value = row?.rowValue
	$: editable = enrichedColumnOptions?.canEdit

	// the proposed height
	export let height

	export let minHeight

	let contents, size, cellHeight, rowElement, open 

	// Ractive request for additional height if needed 
	$: if ( size &&  enrichedColumnOptions.hasChildren ) 
	{ 
		cellHeight = Math.ceil (parseFloat($size.height))

		if ( cellHeight > height ) 
		{
			dispatch( "resize" , { height : cellHeight })
		} else if ( cellHeight < minHeight) {
			dispatch( "resize" , { height : minHeight })
		}
	}

	$: if ( enrichedColumnOptions.hasChildren && contents ) size = elementSizeStore(contents) 
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
	bind:this={rowElement}
	class="spectrum-Table-row" 
	class:is-selected={isSelected} 
	class:is-hovered={isHovered}
	style:height={ height + "px" }
	on:mouseenter={ () => dispatch("hovered") } 
	on:mouseleave={ () => dispatch("unHovered") }
	on:click={ () => dispatch("rowClicked", {rowKey : rowKey}) }
	>
	{#if isLoading }
		<CellSkeleton />
	{:else}
		{#if !enrichedColumnOptions.hasChildren }
			<SuperTableCell 
				{rowKey} 
				{valueTemplate}
				{value} 
				{editable} 
				{fieldSchema} 
				submitOn = { $tableOptionStore?.submitOn }
				{isHovered} 
				/> 
		{:else if popup}
			<div class="wrapper" on:click={() => open = !open } >
				<Icon size="XS" hoverable color={"var(--spectrum-global-color-gray-500)"} name="InfoOutline" />
				<SuperTableCell 
					{rowKey} 
					{valueTemplate}
					{value} 
					{fieldSchema} 
					submitOn = { $tableOptionStore?.submitOn }
					{isHovered} 
				/> 
				<Popover {open} anchor={rowElement} align="left" dismissible >
					<Provider data={ {rowKey: rowKey, Value: value} }>
							<slot /> 
					</Provider>
				</Popover>
			</div>
		{:else}
			<div bind:this={contents} class="contentsWrapper"> 
				<Provider data={ {rowKey: rowKey, Value: value} }>
					<slot /> 
				</Provider>
			</div>	
		{/if}
	{/if}
</div>

<style>
	.spectrum-Table-row {
		display: flex;
		align-items: stretch;
		justify-content: stretch;	
	}

	.wrapper {
		flex: auto;
		display: flex;
		align-items: stretch;
		justify-content: stretch;
		padding-right: var(--super-table-cell-padding);
		padding-left: var(--super-table-cell-padding);
	}

	.wrapper:hover {
		color: var(--primaryColor);
		cursor: pointer;
	}
	.contentsWrapper {
		flex: auto;
		height: fit-content;
	}
	.is-hovered {
		background-color: var(--spectrum-table-m-regular-row-background-color-hover, var(--spectrum-alias-highlight-hover));
	}
	.is-hovered.is-selected {
		background-color: var(--spectrum-table-m-regular-row-background-color-selected-hover, var(--spectrum-alias-highlight-selected-hover));
	}

	.is-selected {
		background-color: var(--spectrum-table-m-regular-row-background-color-selected, var(--spectrum-alias-highlight-selected));
	}
</style>