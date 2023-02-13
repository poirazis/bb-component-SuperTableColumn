<script>
	// Expects an array of relatioship objects
	export let value
	let open = false
</script>

	<ul class="spectrum-TreeView spectrum-TreeView--sizeS">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<li class="spectrum-TreeView-item" class:is-open={open} >
			<span on:click={() => open = !open}  class="spectrum-TreeView-itemLink outer">
				<svg class="spectrum-Icon spectrum-UIIcon-ChevronRight100 spectrum-TreeView-itemIndicator" focusable="false" aria-hidden="true">
					<use xlink:href="#spectrum-css-icon-Chevron100" />
				</svg>
				<span class="spectrum-TreeView-itemLabel"> <slot/> </span>
			</span>
			<ul class="spectrum-TreeView spectrum-TreeView--sizeS">
				{#each value as item }
					<li class="spectrum-TreeView-item">
						<span class="spectrum-TreeView-itemLink"><span class="spectrum-TreeView-itemLabel">{item.primaryDisplay}</span></span>
					</li>					
				{/each}
			</ul>
		</li>
	</ul>

<style>

	.spectrum-TreeView {
		padding: unset;
		margin: unset;
	}
	.spectrum-TreeView-itemLink {
		padding-left: 22px;
		color: var(--spectrum-table-m-regular-cell-text-color);
	}
	.spectrum-TreeView-itemLink.outer {
		padding-left: 22px;
		padding-top: unset;
		padding-bottom: unset;
		height: unset;
	}
	.spectrum-TreeView-itemLink::before {
		content: none;
	}
</style>