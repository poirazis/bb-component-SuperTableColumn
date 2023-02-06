<script>
	import { getContext, createEventDispatcher } from "svelte";
	import Skeleton from "./Skeleton.svelte";

	const { Provider } = getContext("sdk")
	const dispatch = createEventDispatcher();

	export let rowKey
	export let cellValue
	export let isSelected
	export let isHovered
	export let loading
	
	// only used to notify the Parent that we need more space than the given minHeight
	export let needHeight

	// the proposed height
	export let minHeight 

	let innerHeight = minHeight
	$: needHeight = innerHeight
</script>

<div 
	on:mouseenter={ () => dispatch("hovered") } 
	on:mouseleave={ () => dispatch("unHovered") }
	class="spectrum-Table-row" 
	class:is-selected={isSelected} 
	class:is-hovered={isHovered}
	style:--row-height={minHeight + "px"}
	>
		<div bind:clientHeight={innerHeight} class="spectrum-Table-cell" style:width={loading ? "100%" : "min-content"}>
			{#if loading}
				<Skeleton>Loading</Skeleton>
			{:else}
				<Provider data={ {rowID: rowKey, cellValue: cellValue} }>
					<slot />				
				</Provider>
			{/if}
		</div>
</div>

<style>
	.spectrum-Table-row {
		flex: 1 0 auto;
		display: flex;
		min-height: fit-content;
		height: var(--row-height);
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