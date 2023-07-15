<script>
	import { onMount, getContext, createEventDispatcher } from "svelte";
	import { elementSizeStore } from "svelte-legos";

	const { Provider } = getContext("sdk")
	const dispatch = createEventDispatcher();

	export let rowKey
	export let cellValue
	export let isSelected
	export let isHovered
	export let verticalPadding = 11
	export let borderWidth = 1

	// only used to notify the Parent that we need more space than the given minHeight
	export let needHeight 

	// the proposed height
	export let minHeight
	
	let ref
	let size = null

	$: if ( size ) 
	{ 
		needHeight =  Math.ceil (parseFloat($size.height)) + ( 2 * verticalPadding ) + borderWidth
		dispatch( "resize" , { height : needHeight })
	}

	onMount ( () => { 
			size = elementSizeStore(ref) 
	})
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
	class="spectrum-Table-row" 
	class:is-selected={isSelected} 
	class:is-hovered={isHovered}
	style:min-height={ minHeight + "px" }
	on:mouseenter={ () => dispatch("hovered") } 
	on:mouseleave={ () => dispatch("unHovered") }
	on:click={ () => dispatch("rowClicked", {rowKey : rowKey}) }
	>
		<div bind:this={ref} class="spectrum-Table-cell">
			<Provider  data={ {rowKey: rowKey, cellValue: cellValue} }>					
				<slot />				
			</Provider>
		</div>
</div>

<style>

.spectrum-Table-cell {
	display: block;
	min-height: unset;
}

.spectrum-Table-row {
	display: flex;
	flex-direction: column;
	justify-content: var(--super-table-row-vertical-align);
	align-items: var(--super-table-row-horizontal-align);
	border-bottom-width: var(--super-table-row-bottom-border-size);
}
.is-hovered {
	background-color: var(--spectrum-table-m-regular-row-background-color-hover, var(--spectrum-alias-highlight-hover));
}
.is-hovered.is-selected {
	background-color: var(--spectrum-table-m-regular-row-background-color-selected-hover, var(--spectrum-alias-highlight-selected-hover));
}
</style>