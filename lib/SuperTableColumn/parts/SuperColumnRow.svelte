<script>
	import { createEventDispatcher } from "svelte";
	import { SuperTableCell } from "../../../bb-component-SuperTableCell/lib/SuperTableCell/index.js";

	const dispatch = createEventDispatcher();

	export let rowKey
	export let cellValue
	export let isSelected
	export let isHovered

	// the proposed height
	export let minHeight
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
	 <SuperTableCell {rowKey} value = {cellValue} cellOptions ={ {editable : true } }/>
</div>

<style>
.spectrum-Table-row {

	border-bottom-width: var(--super-table-row-bottom-border-size);
}
.is-hovered {
	background-color: var(--spectrum-table-m-regular-row-background-color-hover, var(--spectrum-alias-highlight-hover));
}
.is-hovered.is-selected {
	background-color: var(--spectrum-table-m-regular-row-background-color-selected-hover, var(--spectrum-alias-highlight-selected-hover));
}
</style>