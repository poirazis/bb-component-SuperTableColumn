<script>
	import { getContext , createEventDispatcher } from "svelte";
	import { SuperTableCell } from "../../../bb-component-SuperTableCell/lib/SuperTableCell/index.js";
	import { elementSizeStore } from "svelte-legos";

	const { Provider } = getContext("sdk")
	const tableOptionStore = getContext("tableOptionStore");
	const tableStateStore = getContext("tableStateStore");

	const dispatch = createEventDispatcher();

	export let row
	export let index
	export let columnOptions
	export let isSelected
	export let isHovered
	export let isLoading
	// the proposed height
	export let height
	export let minHeight

	let contents, size, cellHeight, rowElement 

	$: height = $tableStateStore?.rowHeights[index]
	$: minHeight = $tableOptionStore?.rowHeight

	$: if ( columnOptions.hasChildren && contents ) size = elementSizeStore(contents) 

	// Ractive request for additional height if needed 
	$: if ( size &&  columnOptions.hasChildren ) 
	{ 
		cellHeight = Math.ceil (parseFloat(contents?.scrollHeight))
		if ( cellHeight > height ) 
		{
			dispatch( "resize" , { height : cellHeight })
		} else if ( cellHeight < minHeight) {
			dispatch( "resize" , { height : minHeight })
		}
	}
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
	on:click={ () => dispatch("rowClicked", { rowKey : row?.rowKey }) }
	>
	{#if !columnOptions.hasChildren }
		<SuperTableCell 
			rowKey={ row?.rowKey }
			valueTemplate={ columnOptions?.template }
			value= { row?.rowValue }
			editable={ columnOptions?.canEdit }
			fieldSchema={ columnOptions?.schema ?? {} }
			submitOn = { $tableOptionStore?.submitOn }
			{isHovered} 
			{columnOptions}
		/> 
	{:else}
		<div bind:this={contents} class="contentsWrapper"> 
			<Provider data={ { rowKey: row?.rowKey, Value: row?.rowValue } }>
				<slot /> 
			</Provider>
		</div>	
	{/if}
</div>

<style>
	.spectrum-Table-row {
		display: flex;
		align-items: stretch;
		justify-content: stretch;	
	}
	.contentsWrapper {
		flex: 1 1 auto;
		display: flex;
		align-items: center;
		justify-content: stretch;	
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