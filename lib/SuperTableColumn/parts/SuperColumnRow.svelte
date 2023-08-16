<script>
	import { getContext , createEventDispatcher } from "svelte";
	import { elementSizeStore } from "svelte-legos";
	const { Provider } = getContext("sdk")

	import Popover from "../../../node_modules/@budibase/bbui/src/Popover/Popover.svelte";
	import { SuperTableCell } from "../../../bb-component-SuperTableCell/lib/SuperTableCell/index.js";
	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"

	const dispatch = createEventDispatcher();

	export let rowKey
	export let value
	export let isSelected
	export let isHovered
	export let dynamicHeight
	export let popup
	export let editable
	export let fieldSchema
	export let valueTemplate


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
		{#if !dynamicHeight }
			<Provider data={ value } >
				<SuperTableCell {rowKey} {valueTemplate} {value} {editable} {fieldSchema} /> 
			</Provider>
		{:else if popup}
			<div class="wrapper">
				<SuperTableCell {rowKey} {value} {editable} {fieldSchema} /> 
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
</div>

<style>
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
	.spectrum-Table-row {
		background: var(--super-column-bgcolor);
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