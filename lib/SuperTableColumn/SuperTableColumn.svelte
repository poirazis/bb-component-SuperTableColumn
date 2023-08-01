<script>
  import {
    getContext,
    onDestroy,
    beforeUpdate,
  } from "svelte";

  import { writable, derived } from "svelte/store";
  import fsm from "svelte-fsm";

  import SuperColumnHeader from "./parts/SuperColumnHeader.svelte";
  import SuperColumnRow from "./parts/SuperColumnRow.svelte";
  import SuperColumnFooter from "./parts/SuperColumnFooter.svelte";

  const tableDataStore = getContext("tableDataStore");
  const tableStateStore = getContext("tableStateStore");
  const tableFilterStore = getContext("tableFilterStore");
  const tableSelectionStore = getContext("tableSelectionStore");
  const tableScrollPosition = getContext("tableScrollPosition");
  const tableHoverStore = getContext("tableHoverStore");
  const tableOptions = getContext("tableOptions");

  const columnState = fsm("Idle", {
    Idle: { sort: "Ascending", filter: "Entering" },
    Ascending: { sort: "Descending", unsort: "Idle", filter: "Entering" },
    Descending: { sort: "Ascending", unsort: "Idle", filter: "Entering" },
    Entering: { apply: "Filtered", cancel: "Idle" },
    Filtered: { apply: "Filtered", clear: "Entering", cancel: () => { tableFilterStore?.clearFilter({ id: id }); return "Idle" } }
  });

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

  $: fieldSchema = $tableDataStore.schema[columnOptions.name]
  $: columnType = fieldSchema.type;

  $: if (
    $tableDataStore.sortColumn !== columnOptions.name &&
    $columnState != "view"
  ) {
    columnState.unsort();
  }

  // Remove Dynamic Heights if all children have been removed
  $: if (!columnOptions.hasChildren) {
    tableStateStore?.removeRowHeights(id);
  }
  // Component Code
  let nameStore = writable();
  $: nameStore.set(columnOptions.name);

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
  $: tableDataStore?.updateColumn({ id: id, field: columnOptions.name });

  function handleSort() {
    columnState.sort();
    $tableDataStore.sortColumn = columnOptions.name;
    $tableDataStore.sortDirection = $columnState
  }

  function handleFilter(event) {
    if (event.detail.value != "" )  {
      tableFilterStore?.setFilter({
        id: id,
        field: columnOptions.name,
        operator: event.detail.operator,
        value: event.detail.value,
        valueType: "Value",
      });
      columnState.apply();
    } else {
      columnState.clear()
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

  onDestroy(() =>
    tableDataStore?.unregisterColumn({ id: id, field: columnOptions.name })
  );

</script>

<div
  class="superTableColumn"
  style:--super-column-bgcolor={columnOptions.background}
  style:--super-column-color={columnOptions.color}
  style:--super-column-alignment={columnOptions.align == "Right"
    ? "flex-end"
    : columnOptions.align == "Center"
    ? "center"
    : "flex-start"}
  on:mouseleave={() => ($tableHoverStore = null)}
>
  <!-- Render Column Header -->
  <SuperColumnHeader
    on:sort={handleSort}
    on:showFilter={columnState.filter}
    on:applyFilter={handleFilter}
    on:clearFilter={columnState.cancel}
    state={$columnState}
    filtering={columnOptions.filtering}
    sorting={columnOptions.sorting && (fieldSchema?.sortable ?? true) }
    {fieldSchema}
  >
    {columnOptions.displayName}
  </SuperColumnHeader>

  <!-- Render Column Body -->
  <div
    class="spectrum-Table-body"
    bind:this={tableBodyContainer}
    on:scroll|stopPropagation={handleScroll}
    on:mouseenter={() => (mouseOver = true)}
    on:mouseleave={() => (mouseOver = false)}
  >
    {#each $columnStore as row, index}
      <SuperColumnRow
        dynamicHeight={columnOptions.hasChildren}
        popup={ columnOptions.hasChildren && columnOptions.popup }
        {columnType}
        height={$tableStateStore?.rowHeights[index]}
        minHeight={tableOptions.rowHeight}
        rowKey={row.rowKey}
        value={row.rowValue}
        editable={tableOptions.editable || columnOptions.editable}
        isHovered={$tableHoverStore == index}
        isSelected={$tableSelectionStore[row.rowKey]}
        on:resize={(event) =>
          tableStateStore.resizeRow(id, index, event.detail.height)}
        on:hovered={() => ($tableHoverStore = index)}
        on:rowClicked={(e) => ($tableStateStore.rowClicked = row.rowKey)}
      >
        <slot />
      </SuperColumnRow>
    {/each}
  </div>

  {#if tableOptions.showFooter}
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
