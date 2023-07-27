<script>
	import { createEventDispatcher } from "svelte";
	import SuperColumnHeaderSearchControl from "./SuperColumnHeaderSearchControl.svelte";

	const dispatch = createEventDispatcher()

	export let filtering
	export let filteringOperators
	export let sorting
	export let resizable
	export let filteredValue = ""
	export let filteringOperator

	// In which state to render itself depending on the state of the column
	export let state 

	// When the header is resized, ßnotify the Parent Component to adjust accordingly
	export let flexBasis = "auto"

	// Column Resize Functionality
	export let isResizing = false
	let startPos
	let container
	let initialWidth

	function startResizing( event ) {
		isResizing = true
		startPos = event.clientX
    initialWidth = container?.getBoundingClientRect().width;
	} 

	function stopResizing() {
		if ( isResizing ) {
			isResizing = false
			startPos = null
			initialWidth = null
		}
	}

	function resetResizing ( event ) {
		flexBasis = "auto"
	}

	function resize( event ) {
		if (!isResizing) 
			return 
		else {
      flexBasis = initialWidth + (event.clientX - startPos) + "px"
    }
	}

	$: dispatch( "applyFilter", {filteredValue: filteredValue, operator: filteringOperator } )	
</script>

<div class="spectrum-Table-headCell">

	{#if filtering && state != "showFilter" }
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div 
			class="headerActions"
			on:click={() => dispatch("showFilter")}>
			<svg xmlns="http://www.w3.org/2000/svg" height="12px" viewBox="0 0 18 18" width="12px">
				<rect id="Canvas" fill="#ff13dc" opacity="0" width="12px" height="12px" /><path class="fill" d="M7.4,13.5A6.573,6.573,0,0,1,9,9.2945c1.0415-1.3445,5.8665-7.486,5.8665-7.486A.5.5,0,0,0,14.473,1H.527a.5.5,0,0,0-.3935.8085L6,9.2945V16.95a.496.496,0,0,0,.84.4125L8.009,16.143A6.06548,6.06548,0,0,1,7.4,13.5Z" />
				<path class="fill" d="M13.5,9.05a4.45,4.45,0,1,0,4.45,4.45A4.45,4.45,0,0,0,13.5,9.05Zm2.5,4.7a.25.25,0,0,1-.25.25H14v1.75a.25.25,0,0,1-.25.25h-.5a.25.25,0,0,1-.25-.25V14H11.25a.25.25,0,0,1-.25-.25v-.5a.25.25,0,0,1,.25-.25H13V11.25a.25.25,0,0,1,.25-.25h.5a.25.25,0,0,1,.25.25V13h1.75a.25.25,0,0,1,.25.25Z" />
			</svg>
		</div>
	{/if}

	{#if state != "showFilter"}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div 
			on:click={() =>{ if ( sorting ) dispatch("sort") }} 
			class="headerLabel" 
			style:--header-label-cellpadding={ filtering ? "0.85rem" : null  }
			class:sortable={sorting}
		>
		<div class="headerLabelText"><slot /></div>
			
	</div>	
	{:else} 
		<SuperColumnHeaderSearchControl
			bind:value={filteredValue}
			bind:filteringOperator={filteringOperator}
			{filteringOperators}
			on:closeMe={() => dispatch ("clearFilter")}
		/>
	{/if}

	{#if state == "sortedAscending" || state == "sortedDescending" }
		<div class="headerSort" 	
			style:--indicatorRotation={ state === "sortedAscending" ? "90deg" : "-90Deg"}>
			<svg class = "sortIndicator" xmlns="http://www.w3.org/2000/svg" height=10px; viewBox="0 0 10 10">
				<g id="ArrowSize100" >
					<path d="M9.94952,4.99652a.87815.87815,0,0,0-.02966-.15259.854.854,0,0,0-.03522-.17315L9.882,4.66217A.86384.86384,0,0,0,9.7464,4.459a.819.819,0,0,0-.04718-.07226l-.00488-.005-.00086-.00079L6.62354,1.26172A.87459.87459,0,1,0,5.37646,2.48828L6.98682,4.125H.9248a.875.875,0,0,0,0,1.75h6.062L5.37646,7.51172A.87459.87459,0,1,0,6.62354,8.73828l3.06994-3.1192.00086-.00079.00488-.005A.819.819,0,0,0,9.7464,5.541.86384.86384,0,0,0,9.882,5.33783l.00262-.00861a.854.854,0,0,0,.03522-.17315.87815.87815,0,0,0,.02966-.15259L9.9502,5Z"/>
				</g>
			</svg>				
		</div>
	{/if}
</div>

<style>

	.spectrum-Table-headCell {
		display: flex;
		flex-direction: row;
		justify-content: stretch;
		align-items: stretch;
		min-height: 2.5rem;
		padding: unset;
		border-bottom: 1px solid var(--spectrum-alias-border-color-mid);
	}

	.headerActions {
		width: calc(var(--super-table-cell-padding) + 12px);
		display: flex;
		background-color: transparent;
		align-items: center;
		justify-content: center;
		fill: var(--spectrum-table-header-text-color, var(--spectrum-alias-label-text-color));
		transition: scale 130ms ease-in-out;
		padding-left: var(--super-table-cell-padding);
	}

	.headerActions:hover {
		filter: brightness(120%);
		cursor: pointer;
		scale: 1.2;
	}
	.headerLabel {
		flex: auto;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-content: center;
		color: var(--spectrum-table-header-text-color, var(--spectrum-alias-label-text-color));
		padding-left: var(--header-label-cellpadding, var(--super-table-cell-padding));
		padding-right: var(--header-label-cellpadding, var(--super-table-cell-padding));
	}

	.headerLabelText {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;

	}
	.sortable:hover {
		white-space: nowrap;
		filter: brightness(120%);
		cursor: pointer;
	}

	.headerSort {
		width: calc(var(--super-table-cell-padding) + 10px);
		display: flex;
		align-items: center;
		padding-right: var(--super-table-cell-padding);
	}

	.sortIndicator {
		max-height: 10px;
		transition: tranform 300ms ease-in-out;
		transform: rotate( var(--indicatorRotation) );
		fill: var(--spectrum-table-header-text-color, var(--spectrum-alias-label-text-color));
	}
</style>