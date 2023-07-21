<script>
  import {
    getContext,
    onDestroy,
    beforeUpdate,
    createEventDispatcher,
  } from "svelte";
  import { writable, derived } from "svelte/store";
  import fsm from "svelte-fsm";

  import SuperColumnHeader from "./parts/SuperColumnHeader.svelte";
  import SuperColumnRow from "./parts/SuperColumnRow.svelte";
  import SuperColumnRowContainer from "./parts/SuperColumnRowContainer.svelte";
  import SuperColumnFooter from "./parts/SuperColumnFooter.svelte";

  const tableDataStore = getContext("tableDataStore");
  const tableStateStore = getContext("tableStateStore");
  const tableFilterStore = getContext("tableFilterStore");
  const tableSelectionStore = getContext("tableSelectionStore");
  const tableScrollPosition = getContext("tableScrollPosition");
  const tableOptions = getContext("tableOptions");

  // The Super Columns can dispatch a number of events to be handled by the
  // Super Table for Sorting and Filtering and other operations
  const dispatch = createEventDispatcher();

  // Props
  export let columnOptions;
  export let columnWidth;
  export let minWidth;
  export let searchMode;

  // Internal Variables
  let flexBasis = "auto";
  let resizing = false;
  let id = Math.random();
  let mouseOver = false;

  // Static

  // Reactive

  // Super Column Internal State Machine
  const columnState = fsm("view", {
    view: {
      filter: "showFilter",
      sort: "sortedAscending" 
    },
    showFilter: {
      clearFilter() {
        console.log("clearing");
        return "view";
      },
    },
    sortedAscending: { filter: "showFilter", sort: "sortedDescending" },
    sortedDescending: { filter: "showFilter", sort: "sortedAscending" },
  });

  $: combinedOptions = { ...tableOptions.columnOptions, ...columnOptions };

  // Remove Dynamic Heights if all children have been removed
  $: if (!columnOptions.hasChildren) {
    tableStateStore?.removeRowHeights(id);
  }

  // Generate Default settings for Cell Renderers
  $: cellOptions = {
    paddingLeft: "12px",
    borderBottom: undefined,
    borderRight: undefined,
    editable: false,
  };

  // Component Code
  let nameStore = writable();
  $: nameStore.set(columnOptions.name);
  $: field = columnOptions.name;

  // Create our derived store and make sure we grab only the selected field rows.
  // If the field changes, the store will update to reflect the change
  let columnStore =
    derived([tableDataStore, nameStore], ([$tableDataStore, $nameStore]) => {
      return $tableDataStore?.data.map((row) => ({
        rowKey: row[$tableDataStore.idColumn],
        rowValue: row[$nameStore],
      }));
    }) || null;

  // Reinitialize when another field is selεcted or after a DND
  $: initializeColumn(columnOptions.name);
  $: tableDataStore?.updateColumn({ id: id, field: field });

  function handleSort() {
    columnState.sort() ;
    $tableDataStore.sortColumn = columnOptions.name;
    $tableDataStore.sortDirection = $columnState == "sortedAscending" ? "Ascending" : "Descending"
  }

  function handleFilter(event) {
    if (event.detail.filteredValue !== "") {
      tableFilterStore?.setFilter({
        id: id,
        field: field,
        operator: "string",
        value: event.detail.filteredValue,
        valueType: "Value",
      });
    } else {
      tableFilterStore?.clearFilter({ id: id });
    }
  }

  function initializeColumn(field) {
    if (!field) return;
    // unregister before registering to cover for in builder DND
    tableDataStore?.unregisterColumn({ id: id, field: field });
    // Register the column to the tableStore, and get back a writable store
    tableDataStore?.registerColumn({ id: id, field: field });
  }

  // Scrolling Synchonicity Code
  // Notify the tableStateStore that you have been scrolled
  let tableBodyContainer;
  function handleScroll(e) {
    if (mouseOver) {
      $tableScrollPosition = tableBodyContainer?.scrollTop;
    }
  }

  beforeUpdate(() => {
    if (
      tableBodyContainer &&
      tableBodyContainer.scrollTop != $tableScrollPosition
    )
      tableBodyContainer.scrollTop = $tableScrollPosition;
  });

  onDestroy(() => tableDataStore?.unregisterColumn({ id: id, field: field }));

  $: console.log($columnState)
</script>

<div
  class="superTableColumn"
  on:mouseleave={() => tableStateStore.unhoverRow()}
>
  <SuperColumnHeader
    on:sort={handleSort}
    on:showFilter={columnState.filter}
    on:applyFilter={handleFilter}
    on:clearFilter={columnState.clearFilter}
    state={$columnState}
    searchable={columnOptions.filtering}
    sortable={columnOptions.sorting}
  >
    {columnOptions.displayName}
  </SuperColumnHeader>

  {#if columnOptions.hasChildren}
    <div
      bind:this={tableBodyContainer}
      on:scroll|capture|preventDefault={handleScroll}
      on:mouseenter={() => {
        mouseOver = true;
      }}
      on:mouseleave={() => (mouseOver = false)}
      class="spectrum-Table-body"
      class:resizing
    >
      {#each $columnStore as row, index}
        <SuperColumnRowContainer
          on:hovered={() => tableStateStore.hoverRow(id, index)}
          on:rowClicked={(e) => ($tableStateStore.rowClicked = row.rowKey)}
          on:resize={(e) => {
            tableStateStore.resizeRow(id, index, e.detail.height);
          }}
          minHeight={$tableStateStore?.rowHeights[index]}
          rowKey={row.rowKey}
          cellValue={row.rowValue ?? false}
          isHovered={$tableStateStore?.hoveredRow == index ||
          $tableStateStore.hoveredColumn == id}
          isSelected={$tableSelectionStore[row.rowKey]}
        >
          <slot />
        </SuperColumnRowContainer>
      {/each}
    </div>
  {:else}
    <div
      class="spectrum-Table-body"
      class:resizing
      bind:this={tableBodyContainer}
      on:scroll|stopPropagation={handleScroll}
      on:mouseenter={() => {
        mouseOver = true;
      }}
      on:mouseleave={() => (mouseOver = false)}
    >
      {#each $columnStore as row, index}
        <SuperColumnRow
          {cellOptions}
          minHeight={$tableStateStore?.rowHeights[index]}
          rowKey={row.rowKey}
          cellValue={row.rowValue ?? "🌵 Field Doesnt Exist"}
          isHovered={$tableStateStore?.hoveredRow == index}
          isSelected={$tableSelectionStore[row.rowKey]}
          on:hovered={() => tableStateStore.hoverRow(id, index)}
          on:rowClicked={(e) => ($tableStateStore.rowClicked = row.rowKey)}
        />
      {/each}
    </div>
  {/if}

  {#if combinedOptions.showFooter}
    <SuperColumnFooter>{columnOptions.displayName}</SuperColumnFooter>
  {/if}
</div>

<style>
  .superTableColumn {
    flex: auto;
    border-right: var(--super-table-vertical-dividers);
  }

  .spectrum-Table-body {
    height: var(--super-table-body-height);
    border-radius: 0px;
    overflow-y: scroll !important;
    overflow-x: hidden;
    padding: 0px;
    margin: 0px;
    border: none;
    scrollbar-width: none;
  }

  .spectrum-Table-body::-webkit-scrollbar {
    display: none;
  }
  .resizing {
    border-right: 1px dotted lime;
  }
</style>
