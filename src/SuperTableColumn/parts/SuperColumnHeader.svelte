<script>
	import { createEventDispatcher } from "svelte";
	import SuperColumnHeaderSearchControl from "./SuperColumnHeaderSearchControl.svelte";

	const dispatch = createEventDispatcher()

	export let searchable
	export let sortable
	export let resizable
	export let isSorted
	export let sortDirection
	export let filteredValue = ""
	export let scrolPos

	// When the header is resized, notify the Parent Component to adjust accordingly
	export let flexBasis = "auto"

	let showSearch = false
	let showSort

	// Column Searching / Filtering Functionality
	function toggleSearch() {
		showSearch = !showSearch
	}

	// Column Sorting Functionality
	function toggleSort() {
		showSort = !showSort
	}

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

	function handleClick () {
		if (sortable) {
			if (isSorted) 
				sortDirection = sortDirection === "Ascending" ? "Descending" : "Ascending" 
			else 
				sortDirection = "Ascending"

			dispatch("sort", { sortDirection: sortDirection })
		}
	}

	$: dispatch("filter", {filteredValue: showSearch ? filteredValue : ""})	
</script>

<svelte:window on:mouseup={stopResizing} />
<div 
    class="spectrum-Table-headCell"
		class:is-scrolled={scrolPos > 10 }
		style:--indicatorRotation={ sortDirection === "Ascending" ? "90deg" : "-90Deg"}
		on:mousemove={resize} 
		bind:this={container}	
		>

		{#if searchable}
			<div class="headerActions">
				<button on:click={toggleSearch}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
					<path d="M15.77,14.70942l-4.53431-4.53431a6.01393,6.01393,0,1,0-1.06055,1.06055L14.70942,15.77A.74992.74992,0,1,0,15.77,14.70942ZM6.5,11A4.5,4.5,0,1,1,11,6.5,4.50508,4.50508,0,0,1,6.5,11Z" />
				</svg>
			</button>
			</div>
		{/if}
	
		<div class="headerContents">
			{#if !showSearch}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div 
					on:click={handleClick} 
					class="headerLabel" 
					class:sortable={sortable}
					>
					<slot />
				</div>	
			{:else} 
				<SuperColumnHeaderSearchControl on:closeMe={()=> (showSearch = false)} bind:value={filteredValue}/>
			{/if}

			{#if isSorted}
			<div class="headerSort">
				<svg class = "sortIndicator" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
					<g id="ArrowSize100" >
						<path d="M9.94952,4.99652a.87815.87815,0,0,0-.02966-.15259.854.854,0,0,0-.03522-.17315L9.882,4.66217A.86384.86384,0,0,0,9.7464,4.459a.819.819,0,0,0-.04718-.07226l-.00488-.005-.00086-.00079L6.62354,1.26172A.87459.87459,0,1,0,5.37646,2.48828L6.98682,4.125H.9248a.875.875,0,0,0,0,1.75h6.062L5.37646,7.51172A.87459.87459,0,1,0,6.62354,8.73828l3.06994-3.1192.00086-.00079.00488-.005A.819.819,0,0,0,9.7464,5.541.86384.86384,0,0,0,9.882,5.33783l.00262-.00861a.854.854,0,0,0,.03522-.17315.87815.87815,0,0,0,.02966-.15259L9.9502,5Z"/>
					</g>
				</svg>				
			</div>
			{/if}
		</div>
		{#if resizable}
			<div on:dblclick={resetResizing} on:mousedown={startResizing.bind(this)} class="headerResizeKnob">				
			</div>
		{/if}
</div>

<style>

	.spectrum-Table-headCell {
		flex: 0 1 auto;
		display: flex;
		flex-direction: row;
		justify-content: stretch;
		align-items: center;
 		gap: 8px;
		min-height: 2.5rem;
		padding-right: 8px;
	}
	.is-scrolled {
		/* box-shadow: 0px 10px 5px -2px #191919; */
		z-index: 100;
	}
	.headerActions {
		flex: 0 0 auto;
		min-height: 12px;
		aspect-ratio: 1 / 1;
		background-color: transparent;
		align-items: center;
		fill: var(--spectrum-table-header-text-color, var(--spectrum-alias-label-text-color));
	}

	.headerActions > button {
		border: none;
		padding: 0px;
		margin: 0px;
		background-color: transparent;
		height: 100%;
		width: 100%;
		fill: var(--st-header-text-color);
	}

	.headerActions:hover > button {
		filter: brightness(120%);
		cursor:pointer;
	}

	.headerContents {
		flex: 1;
		display: flex;
		flex-direction: row;
		justify-content: var(--super-table-header-horizontal-align);
		align-items: center;
		gap: 8px;
	}

	.headerLabel {
		white-space: nowrap;
	}
	.sortable:hover {
		white-space: nowrap;
		filter: brightness(120%);
		cursor:pointer;
	}

	.headerSort {
		flex: 0 0 auto;
		align-items: center;
		width: 10px;
	}

	.sortIndicator {
		transition: tranform 300ms ease-in-out;
		transform: rotate( var(--indicatorRotation) );
		fill: var(--spectrum-table-header-text-color, var(--spectrum-alias-label-text-color));
	}

	.headerResizeKnob {
		padding: 2px 2px;
		margin: 0px 0px;
		width: 5px;
		height: 1rem;
		background-color: var(--spectrum-global-color-gray-300)
	}
	.headerResizeKnob:hover {
		cursor:col-resize ;
		background-color: var(--spectrum-global-color-gray-700)
	}
</style>