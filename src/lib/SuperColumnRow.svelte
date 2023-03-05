<script>
	import { getContext, createEventDispatcher } from "svelte";
	import { fade } from "svelte/transition"
	import { tick } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
  import SuperTableBooleanCell from "./SuperTableBooleanCell.svelte";
  import SuperTableArrayCell from "./SuperTableArrayCell.svelte";
  import SuperTableRelationshipCell from "./SuperTableRelationshipCell.svelte";
	import SuperTableDateCell from "./SuperTableDateCell.svelte";

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
	$: handleHeightChange( innerHeight )

	async function handleHeightChange ( newHeight ) {
		await tick();
		if ( needHeight != innerHeight + 2 ) {
			needHeight = innerHeight + 2
		}
	}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div 
	class="spectrum-Table-row" 
	class:is-selected={isSelected} 
	class:is-hovered={isHovered}
	style:--row-height={minHeight + "px"}
	on:mouseenter={ () => dispatch("hovered") } 
	on:mouseleave={ () => dispatch("unHovered") }
	on:click={ () => dispatch("rowClicked", {rowKey : rowKey}) }
	>
		<div in:fade="{{ duration: 330, easing: cubicInOut }}" bind:clientHeight={innerHeight} class="spectrum-Table-cell">
			{#if hasChildren}
				<Provider  data={ {rowKey: rowKey, cellValue: cellValue} }>					
					<slot />				
				</Provider>
			{:else if Array.isArray(cellValue) }
				{#if typeof cellValue[0] === "string"}
					<SuperTableArrayCell value={cellValue} />
				{:else}
					<SuperTableRelationshipCell value={cellValue}> {cellValue.length ?? 0} {cellValue.length == 1 ? "Item" : "Items"}  </SuperTableRelationshipCell>
				{/if}
			{:else if typeof cellValue === "boolean"}
				<SuperTableBooleanCell isActive={ cellValue } />
			{:else if typeof cellValue === "datetime"}
				<SuperTableDateCell> {cellValue} </SuperTableDateCell>
			{:else}
				<span class="value">{cellValue}</span>
			{/if}
		</div>
</div>

<style>

.spectrum-Table-cell {
	min-height: unset;
}
.value {
	display: inline-block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.spectrum-Table-row {
	display: flex;
	min-height: var(--row-height);
	flex-direction: column;
	justify-content: var(--super-table-row-vertical-align);
	align-items: var(--super-table-row-horizontal-align);
	border-bottom-width: var(--super-table-row-bottom-border-size);
	overflow: hidden;
}
.is-hovered {
	background-color: var(--spectrum-table-m-regular-row-background-color-hover, var(--spectrum-alias-highlight-hover));
}
.is-hovered.is-selected {
	background-color: var(--spectrum-table-m-regular-row-background-color-selected-hover, var(--spectrum-alias-highlight-selected-hover));
}
</style>