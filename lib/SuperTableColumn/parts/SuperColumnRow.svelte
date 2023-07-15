<script>
	import { createEventDispatcher } from "svelte";
  import SuperTableBooleanCell from "../cells/SuperTableBooleanCell.svelte";
  import SuperTableArrayCell from "../cells/SuperTableArrayCell.svelte"
  import SuperTableRelationshipCell from "../cells/SuperTableRelationshipCell.svelte";
	import SuperTableDateCell from "../cells/SuperTableArrayCell.svelte";

	const dispatch = createEventDispatcher();

	export let rowKey
	export let cellValue
	export let isSelected
	export let isHovered

	// the proposed height
	export let minHeight

	$: console.log(cellValue)
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
		<div class="spectrum-Table-cell" 	>
			{#if Array.isArray(cellValue) }
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
	display: block;
	min-height: unset;
}
.value {
	display: block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
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