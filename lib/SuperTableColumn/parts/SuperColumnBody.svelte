<script>
  import { getContext } from "svelte";
  import SuperColumnRow from "./SuperColumnRow.svelte";

  const tableStateStore = getContext("tableStateStore");
  const tableSelectionStore = getContext("tableSelectionStore");
  const tableScrollPosition = getContext("tableScrollPosition");
  const tableHoverStore = getContext("tableHoverStore");

  export let rows = []
  export let columnState
  export let enrichedColumnOptions

  let columnBodyAnchor
  let mouseOver
  
  const handleScroll = () => {
    if (mouseOver) {
      $tableScrollPosition = columnBodyAnchor?.scrollTop;
    }
  }

  const synchScrollPosition = ( position ) => { 
    if (columnBodyAnchor) 
      if ( position != columnBodyAnchor.scrollTop)
      columnBodyAnchor.scrollTop = position 
  }

  $: synchScrollPosition($tableScrollPosition)
</script>

<div
  bind:this={columnBodyAnchor}
  class="spectrum-Table-body"
  style:background-color={$columnState == "Filtered" || $columnState == "Entering" ? "var(--spectrum-global-color-gray-75)" : "var(--super-table-bg-color)" }
  on:scroll={handleScroll}
  on:mouseenter={ () => (mouseOver = true) }
  on:mouseleave={ () => (mouseOver = false) }
  >
    {#each rows as row, index}
      <SuperColumnRow
        {row} 
        {index} 
        {enrichedColumnOptions}
        isLoading={ $columnState == "Loading" }
        isHovered={ $tableHoverStore == index}
        isSelected={ $tableSelectionStore[row.rowKey] }
        on:resize={ (event) => tableStateStore.resizeRow(enrichedColumnOptions.id, index, event.detail.height)}
        on:hovered={() => ($tableHoverStore = index)}
        on:rowClicked={(e) => ($tableStateStore.rowClicked = row.rowKey)}
      >
        <slot />
      </SuperColumnRow>
    {/each}
</div>

<style>
    :global( .spectrum-Table-body > .spectrum-Table-row:last-of-type ){
    border-bottom-style: none;
  }
  .spectrum-Table-body {
    height: var(--super-table-body-height);
    color: var(--super-table-color);
    border-radius: 0px;
    overflow-y: scroll !important;
    overflow-x: hidden;
    padding: 0px;
    margin: 0px;
    border: none;
    scrollbar-width: none;
    border-bottom: none;
  }

  .spectrum-Table-body::-webkit-scrollbar {
    display: none;
  }
</style>