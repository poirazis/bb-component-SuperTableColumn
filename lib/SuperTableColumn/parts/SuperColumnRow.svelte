<script>
	import { getContext , onMount, createEventDispatcher } from "svelte";
	import { elementSizeStore } from "svelte-legos";
	const { Provider } = getContext("sdk")

	import { SuperTableCell } from "../../../bb-component-SuperTableCell/lib/SuperTableCell/index.js";

	const dispatch = createEventDispatcher();

	export let rowKey
	export let value
	export let isSelected
	export let isHovered
	export let dynamicHeight
	export let columnType
	export let editable

	// the proposed height
	export let minHeight

	let contents, size, cellHeight

	// Ractive request for additional height if needed 
	$: if ( size ) 
	{ 
		cellHeight = Math.ceil (parseFloat($size.height))

		if ( cellHeight != minHeight && !( cellHeight < cellOptions.minHeight ) ) 
		{
			dispatch( "resize" , { height : cellHeight })
		}
	}
	onMount ( () => { 
			if (dynamicHeight) size = elementSizeStore(contents) 
	})
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
	class="spectrum-Table-row" 
	class:is-selected={isSelected} 
	class:is-hovered={isHovered}
	style:height={ minHeight + "px" }
	on:mouseenter={ () => dispatch("hovered") } 
	on:mouseleave={ () => dispatch("unHovered") }
	on:click={ () => dispatch("rowClicked", {rowKey : rowKey}) }
	>
		{#if !dynamicHeight }
			<SuperTableCell {rowKey} {value} {editable} {columnType} /> 
		{:else}
			<div bind:this={contents} class="contentsWrapper"> 
				<Provider data={ {rowKey: rowKey, cellValue: value} }>
						<slot /> 
				</Provider>
			</div>	
		{/if}
</div>

<style>

	.contentsWrapper {
		border: none;
	}
	.is-hovered {
		background-color: var(--spectrum-table-m-regular-row-background-color-hover, var(--spectrum-alias-highlight-hover));
	}
	.is-hovered.is-selected {
		background-color: var(--spectrum-table-m-regular-row-background-color-selected-hover, var(--spectrum-alias-highlight-selected-hover));
	}
</style>