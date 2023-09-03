<script>
  import { getContext, onDestroy, beforeUpdate, onMount, createEventDispatcher } from "svelte";
  import { v4 as uuidv4 } from "uuid";
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
  const tableOptionStore = getContext("tableOptionStore");

  const columnState = fsm("Idle", {
    Idle: { sort: "Ascending", filter: () => { return filterable ? "Entering" : "Idle" } },
    Ascending: { sort: "Descending", unsort: "Idle", filter: "Entering" },
    Descending: { sort: "Ascending", unsort: "Idle", filter: "Entering" },
    Entering: { apply: "Filtered", cancel: "Idle" },
    Resizing: { stop: () => { return "Idle" } },
    Dragging: { stop: () => { return "Idle" } },
    Filtered: { apply: "Filtered", clear: "Entering", cancel: () => { tableFilterStore?.clearFilter({ id: id }); return "Idle" } }
  });

  // Props
  export let columnOptions;
  export let columnWidth;
  export let searchMode;

  // Internal Variables
  let id = uuidv4();
  let mouseOver = false;
  let filterable
  let timer
  let debounceDelay = $tableOptionStore.debounce
  
	const debounce = ( v, e ) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
      console.log("Firing!", v );
			v(e);
		}, debounceDelay ?? 750 );
	}

  const dispatch = createEventDispatcher();

  $: fieldSchema = $tableDataStore?.schema ? $tableDataStore?.schema[columnOptions.name] : {}
  $: filterable = fieldSchema?.type != "attachment" && fieldSchema?.type != "link" 
  $: editable = columnOptions.editable && $tableOptionStore?.editable && fieldSchema?.type != "formula"

  $: if (
    $tableDataStore.sortColumn !== columnOptions.name &&
    $columnState != "Idle"
  ) {
    columnState.unsort();
  }

  // Remove Dynamic Heights if all children have been removed
  $: if (!columnOptions.hasChildren) {
    tableStateStore?.removeRowHeights(id);
  }

  // Component Code
  // Create our derived store and make sure we grab only the selected field rows.
  // If the field changes, the store will update to reflect the change
  let nameStore = writable();
  $: nameStore.set(columnOptions.name);

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
    console.log("Filtering")
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

  onDestroy( () => tableDataStore?.unregisterColumn({ id: id, field: columnOptions.name }) );

  // Resizing Code 
  let resizing = false
  let considerResizing = false
  let startPoint 
  let startWidth
  let width
  let column

  const startResizing = ( e ) => {
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    startPoint = e.clientX;
    startWidth = column.clientWidth
    width = startWidth
  }

  const stopResizing = ( e ) => {
    e.preventDefault();
    e.stopPropagation();
    resizing = false;
    startPoint = undefined
    saveBuilderSizing( width )
  }

  const resize = ( e ) => {
    width = startWidth + e.clientX - startPoint
  }

  const resetSize = ( e ) => {
    e.preventDefault();
    e.stopPropagation();
    width = undefined
  }

  const saveBuilderSizing = ( width ) => {
    let column = $tableOptionStore.columns.findIndex( (col) => ( col.name == columnOptions.name) ) 
    if ( column > -1 ) {
      let newColumns = [ ...$tableOptionStore.columns ]
      newColumns[column].width = width
      dispatch("saveSettings", newColumns )
    }
  }

  onMount( () => startWidth = column ? column.clientWidth : "auto" )
</script>

<svelte:window
  on:mouseup={ (e) => { if ( resizing ) stopResizing(e) } } 
  on:mousemove={ (e) => { if ( resizing ) resize(e) } }
  />

<div
  class="superTableColumn"
  class:fixed={ columnOptions.sizing == "fixed" }
  class:resizing
  class:considerResizing={considerResizing && !resizing}
  style:min-width={ width ? width : columnOptions.sizing == "fixed" ? columnOptions.width : "auto" }
  style:max-width={ width ? width : columnOptions.sizing == "fixed" ? columnOptions.width : columnOptions.maxWidth }
  style:--super-cell-control-width={ width ?? startWidth }
  style:--super-column-bgcolor={ columnOptions.backgroundColor }
  style:--super-column-color={columnOptions.color}
  style:--super-column-alignment={columnOptions.align == "Right"
    ? "flex-end"
    : columnOptions.align == "Center"
    ? "center"
    : "flex-start"}
  bind:this={column}
  on:mouseleave={() => ($tableHoverStore = null)}

>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div 
      class="grabber" 
      on:mousedown={ startResizing }
      on:dblclick={ resetSize }
      on:mouseenter={ () => ( considerResizing = true ) } on:mouseleave={ () => ( considerResizing = false ) } /> 

  <!-- Render Column Header -->
  <SuperColumnHeader
    on:sort={handleSort}
    on:applyFilter={ ( e ) => debounce( handleFilter, e ) }
    {columnState}
    filtering={columnOptions.filtering && filterable}
    sorting={columnOptions.sorting && (fieldSchema?.sortable ?? true) }
    {fieldSchema}
  >
    {columnOptions.displayName}
  </SuperColumnHeader>

  <!-- Render Column Body -->
  <div
    class="spectrum-Table-body"
    bind:this={tableBodyContainer}
    on:scroll={handleScroll}
    on:mouseenter={ () => (mouseOver = true) }
    on:mouseleave={ () => (mouseOver = false) }
  >
    {#each $columnStore as row, index}
      <SuperColumnRow
        dynamicHeight={columnOptions.hasChildren}
        popup={ columnOptions.hasChildren && columnOptions.popup }
        valueTemplate = { columnOptions.template }
        {fieldSchema}
        height={$tableStateStore?.rowHeights[index]}
        minHeight={$tableOptionStore?.rowHeight}
        rowKey={row.rowKey}
        value={row.rowValue}
        {editable}
        isHovered={$tableHoverStore == index}
        isSelected={$tableSelectionStore[row.rowKey]}
        on:resize={(event) => tableStateStore.resizeRow(id, index, event.detail.height)}
        on:hovered={() => ($tableHoverStore = index)}
        on:rowClicked={(e) => ($tableStateStore.rowClicked = row.rowKey)}
      >
        <slot />
      </SuperColumnRow>
    {/each}
  </div>

  {#if columnOptions.showFooter }
    <SuperColumnFooter>{columnOptions.displayName}</SuperColumnFooter>
  {/if}
</div>

<style>
  .superTableColumn {
    flex: 1 1 auto;
    position: relative;
    border-right: var(--super-table-vertical-dividers);
    display: flex;
    flex-direction: column;
    align-items: stretch;  
    background-color: var(--spectrum-global-color-gray-75);
  }
  
  .fixed {
    flex: 0 0;
    min-width: var(--super-column-width);
    width: var(--super-column-width);
  }
  .grabber {
    width: 4px;
    position: absolute;
    right: 2px;
    top: 12px;
    height: 16px;
    border-radius: 2px;
    z-index: 999;
    background-color: var(--spectrum-global-color-gray-200);
    transition: all 130ms ease-in-out;
  }

  .grabber:hover {
    background-color: var(--spectrum-global-color-gray-600);
    cursor: col-resize;
  }

  :global( .spectrum-Table-body > .spectrum-Table-row:last-of-type ){
    border-bottom-style: none;
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
    border-bottom: none;
  }

  .spectrum-Table-body::-webkit-scrollbar {
    display: none;
  }
  .resizing {
    border-right: 1px solid var(--primaryColor);
  }
  .considerResizing {
    border-right: 1px solid var(--spectrum-global-color-gray-500);
  }

</style>
