<script>
	import { getContext , createEventDispatcher } from "svelte";
	import { elementSizeStore } from "svelte-legos";
	const { Provider } = getContext("sdk")

	import Popover from "../../../node_modules/@budibase/bbui/src/Popover/Popover.svelte";
	import { SuperTableCell } from "../../../bb-component-SuperTableCell/lib/SuperTableCell/index.js";
	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
	import CellSkeleton from "../../../bb-component-SuperTableCell/lib/SuperTableCell/cells/CellSkeleton.svelte";

	const dispatch = createEventDispatcher();

	const tableOptionStore = getContext("tableOptionStore");
	const tableStateStore = getContext("tableStateStore");

	export let row
	export let index
	export let enrichedColumnOptions
	export let isSelected
	export let isHovered
	export let isLoading

	$: dynamicHeight = enrichedColumnOptions?.hasChildren ?? false
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
	$: if ( size && dynamicHeight ) 
	{ 
		cellHeight = Math.ceil (parseFloat($size.height))

		if ( cellHeight > height ) 
		{
			dispatch( "resize" , { height : cellHeight })
		} else if ( cellHeight < minHeight) {
			dispatch( "resize" , { height : minHeight })
		}
	}

	$: if ( dynamicHeight && contents ) size = elementSizeStore(contents) 

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
		{#if !dynamicHeight }
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
			<div class="wrapper">
				<SuperTableCell 
					{rowKey} 
					{valueTemplate}
					{value} 
					{editable} 
					{fieldSchema} 
					submitOn = { $tableOptionStore?.submitOn }
					{isHovered} 
				/> 
				<Icon on:click={() => open = !open } size="XS" hoverable name="InfoOutline" />
				<Popover {open} anchor={rowElement} >
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
		justify-content: stretch;	}
	.wrapper {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-right: 12px;
	}
	.contentsWrapper {
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