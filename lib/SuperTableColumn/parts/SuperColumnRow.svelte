<script>
	import { getContext , onMount, createEventDispatcher } from "svelte";
	import { elementSizeStore } from "svelte-legos";
	const { Provider } = getContext("sdk")

	import { SuperTableCell } from "../../../bb-component-SuperTableCell/lib/SuperTableCell/index.js";

	const dispatch = createEventDispatcher();

	export let rowKey
	export let cellValue
	export let isSelected
	export let isHovered
	export let dynamicHeight

	// the proposed height
	export let minHeight

	export let cellOptions

	let contents, size, cellHeight

	// Ractive request for additional height if needed 
	$: if ( size ) 
	{ 
		cellHeight = Math.ceil (parseFloat($size.height))
		console.log(minHeight, cellHeight)

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
	style:border-bottom={cellOptions.borderBottom}
	on:mouseenter={ () => dispatch("hovered") } 
	on:mouseleave={ () => dispatch("unHovered") }
	on:click={ () => dispatch("rowClicked", {rowKey : rowKey}) }
	>
		{#if !dynamicHeight }
			<SuperTableCell {rowKey} value = {cellValue} {cellOptions} /> 
		{:else}
			<Provider data={ {rowKey: rowKey, cellValue: cellValue} }>
				<div bind:this={contents} class="contentsWrapper"> 		
					<slot /> 
				</div>	
			</Provider>
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