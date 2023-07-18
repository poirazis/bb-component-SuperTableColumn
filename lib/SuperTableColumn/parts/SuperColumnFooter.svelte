<div class="spectrum-Table-headCell">
    <slot />
</div>

<style>
	.spectrum-Table-headCell {
		white-space: nowrap;
		display: flex;
		flex-direction: row;
		justify-content: var(--super-table-footer-horizontal-align);
		color: var(--super-table-footer-font-color);
		align-items: center;
		min-height: 2.3rem;
		background-color: var(--super-table-footer-background-color);
	}
</style>