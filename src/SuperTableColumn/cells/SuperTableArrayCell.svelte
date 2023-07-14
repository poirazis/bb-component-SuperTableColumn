<script>
	// Expects an Array of strings
	export let value
</script>

{#each value as val}
	<span class="item">{val}</span>
{/each}

<style>
	/* your styles go here */.item {
		display: inline-block;
		margin-right: 4px;
		font-size: 11px;
		line-height: 18px;
		padding-left: 8px;
		padding-right: 8px;
		color: white;
		font-weight: 600;
		border-radius: 3px;
		background-color: var(--spectrum-global-color-gray-500);
	}
</style>