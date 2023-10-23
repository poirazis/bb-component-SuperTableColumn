<script>
  export let columnState
  export let enrichedColumnOptions
</script>

{#if enrichedColumnOptions.showFooter}
  <div class="spectrum-Table-headcell">
      {enrichedColumnOptions.displayName}
  </div>
{/if}

<style>
  .spectrum-Table-headcell {
    width: 100%;
		display: flex;
		align-items: center;
		padding-left: var(--super-table-cell-padding);
		padding-right: var(--super-table-cell-padding);
    height: var(--super-table-footer-height);
		color: var(--super-table-footer-color);
    background-color: var(--super-table-footer-bg-color);
    border-right: var(--super-table-vertical-dividers);
    overflow: hidden;
  }
</style>