<script>
	import { getContext, createEventDispatcher } from "svelte";
	const { Provider } = getContext("sdk")
	const dispatch = createEventDispatcher();

	export let rowKey
	export let cellValue
	export let isSelected
	export let isHovered
	export let loaded
	export let hasChildren

	// only used to notify the Parent that we need more space than the given minHeight
	export let needHeight

	// the proposed height
	export let minHeight 

	let innerHeight
	$: needHeight = innerHeight
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
	on:mouseenter={ () => dispatch("hovered") } 
	on:mouseleave={ () => dispatch("unHovered") }
	on:click={ () => dispatch("rowClicked", {rowKey : rowKey}) }
	class="spectrum-Table-row" 
	class:is-selected={isSelected} 
	class:is-hovered={isHovered}
	style:--row-height={minHeight + "px"}
	>
		<div bind:clientHeight={innerHeight} class="spectrum-Table-cell" style:width={"100%"}>
			{#if hasChildren}
				<Provider data={ {rowKey: rowKey, cellValue: cellValue} }>					
					<slot />				
				</Provider>
			{:else}
				{cellValue}
			{/if}
		</div>
</div>

<style>
	.spectrum-Table-row {
		display: flex;
		min-height: var(--row-height);
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