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

  const { builderStore } = getContext("sdk");
  const dispatch = createEventDispatcher();
  
  const columnState = fsm("Idle", {
    Idle: { 
      sort () { $tableDataStore.sortColumn = enrichedColumnOptions.name; return "Ascending"; } , 
      filter () { return enrichedColumnOptions.canFilter ? "Entering" : "Idle" } 
    },
    Ascending: { 
      _enter () { $tableDataStore.sortDirection = "Ascending"; },
      sort () { return "Descending" }, 
      unsort: "Idle", 
      filter: "Entering" 
    },
    Descending: { 
      _enter() { $tableDataStore.sortDirection = "Descending"; },
      sort() { return "Ascending" },  
      unsort: "Idle", 
      filter: "Entering" 
    },
    Entering: { 
      _enter() { tableFilterStore?.clearFilter({ id: id }); width = column ? column.clientWidth : null },
      filter( operator , value ) { if ( value ) { setFilter(operator , value ); return "Filtered" } },
      cancel() { return "Idle" }
    },
    Resizing: { stop: () => { return "Idle" } },
    Dragging: { stop: () => { return "Idle" } },
    EditingCell: { stop: () => { return "Idle" } },
    Filtered: { 
      filter(operator, value) { value != "" ? setFilter(operator,value) : this.clear() },
      clear() { console.log("Clearing");  return "Entering" },
      cancel() { tableFilterStore?.clearFilter({ id: id }); return "Idle" } 
      }
  });

  // Props
  export let columnOptions;
  export let tableOptions;

  // Internal Variables
  let id = uuidv4();
  let mouseOver = false;
  let enrichedColumnOptions 
  let resizing = false
  let considerResizing = false
  let startPoint 
  let startWidth
  let width
  let column
  let tableBodyContainer
  let filterValue
  let filterOperator

  $: filterValue != undefined && filterOperator ? columnState.filter ( filterOperator , filterValue ) : null 

  // Reactive declaration.
  // nameStore is used in our derived store that holds the column data
  let nameStore = writable(columnOptions.name);
  $: nameStore.set(enrichedColumnOptions.name);
  let columnStore =
    derived([tableDataStore, nameStore], ([$tableDataStore, $nameStore]) => {
      return $tableDataStore?.data.map((row) => ({
        rowKey: row[$tableDataStore.idColumn],
        rowValue: row[$nameStore],
      }));
    }) || null;

  $: enrichedColumnOptions = enrichdOptions(columnOptions)

  $: if (
    $tableDataStore.sortColumn !== enrichedColumnOptions.name &&
    $columnState != "Idle"
  ) {
    columnState.unsort();
  }

  $: if (!enrichedColumnOptions.hasChildren) { tableStateStore?.removeRowHeights(id); }
  $: initializeColumn(enrichedColumnOptions.name);
  $: tableDataStore?.updateColumn({ id: id, field: enrichedColumnOptions.name });

  const enrichdOptions = ( columnOptions ) => {
    return { ...columnOptions, 
      "schema" : $tableDataStore.schema[columnOptions.name] ?? {}
    }
  }

  const setFilter = ( operator , value ) => {
    console.log("Set Filter")

    if ( value )
      tableFilterStore?.setFilter({
        id: id,
        field: enrichedColumnOptions.name,
        operator: operator,
        value: value,
        valueType: "Value",
    })
  }

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
    saveBuilderSizing (null);
  }

  const saveBuilderSizing = ( width ) => {
    let column = $tableOptionStore.columns.findIndex( (col) => ( col.name == columnOptions.name) ) 
    if ( column > -1 ) {
      let newColumns = [ ...$tableOptionStore.columns ]
      newColumns[column].width = width
      dispatch("saveSettings", newColumns )
    }
  }

  function initializeColumn(field) {
    if (!field) return;

    tableDataStore?.unregisterColumn({ id: id, field: field });
    tableDataStore?.registerColumn({ id: id, field: field });
  }

  function handleScroll(e) {
    if (mouseOver) {
      $tableScrollPosition = tableBodyContainer?.scrollTop;
    }
  }

  function handleKeyboard ( e ) {
    if (e.key == "Enter") 
     columnState.filter ( filterOperator, filterValue )
    if (e.key == "Escape") {
      filterValue = ""
      columnState.cancel();
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
  onMount( () => startWidth = column ? column.clientWidth : null )

  $: console.log("State :", $columnState)
</script>

<svelte:window
  on:mouseup={ (e) => { if ( resizing ) stopResizing(e) } } 
  on:mousemove={ (e) => { if ( resizing ) resize(e) } }
  />

<div
  class="superTableColumn"
  class:fixed={ enrichedColumnOptions.sizing == "fixed" }
  class:resizing
  class:considerResizing={considerResizing && !resizing}
  style:min-width={ width ? width : enrichedColumnOptions.sizing == "fixed" ? enrichedColumnOptions.width : "auto" }
  style:max-width={ width ? width : enrichedColumnOptions.sizing == "fixed" ? enrichedColumnOptions.width : columnOptions.maxWidth }
  style:--super-cell-control-width={ width ?? startWidth }
  style:--super-column-bgcolor={ enrichedColumnOptions.backgroundColor }
  style:--super-column-color={enrichedColumnOptions.color}
  style:--super-column-alignment={enrichedColumnOptions.align == "Right"
    ? "flex-end"
    : enrichedColumnOptions.align == "Center"
    ? "center"
    : "flex-start"}
  bind:this={column}
  on:keydown={handleKeyboard}
  on:mouseleave={() => ($tableHoverStore = null)}
>

  {#if columnOptions.superColumn && $builderStore.inBuilder }
    <div class="superBadge">⚡️</div>
  {/if}

  <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div 
      class="grabber" 
      on:mousedown={ startResizing }
      on:dblclick={ resetSize }
      on:mouseenter={ () => ( considerResizing = true ) } on:mouseleave={ () => ( considerResizing = false ) } /> 

  <!-- Render Column Header -->
  <SuperColumnHeader bind:filterValue bind:filterOperator {columnState} {enrichedColumnOptions} {width} />

  <!-- Render Column Body -->
  <div
    class="spectrum-Table-body"
    style:background-color={$columnState == "Filtered" || $columnState == "Entering" ? "var(--spectrum-global-color-gray-75)" : "var(--spectrum-global-color-gray-50)" }
    bind:this={tableBodyContainer}
    on:scroll={handleScroll}
    on:mouseenter={ () => (mouseOver = true) }
    on:mouseleave={ () => (mouseOver = false) }
  >
    {#each $columnStore as row, index}
      <SuperColumnRow
        dynamicHeight={enrichedColumnOptions.hasChildren}
        popup={ enrichedColumnOptions.hasChildren && enrichedColumnOptions.popup }
        valueTemplate = { enrichedColumnOptions.template }
        fieldSchema={enrichedColumnOptions.schema ?? {}}
        height={$tableStateStore?.rowHeights[index]}
        minHeight={$tableOptionStore?.rowHeight}
        rowKey={row.rowKey}
        value={row.rowValue}
        editable={enrichedColumnOptions.canEdit}
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

  {#if enrichedColumnOptions.showFooter }
    <SuperColumnFooter>{enrichedColumnOptions.displayName}</SuperColumnFooter>
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
    width: 3px;
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
    width: 8px;
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

  .superBadge {
    position: absolute;
    top: 10px;
    right: 24px;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    z-index: 100;
    font-size: 11px;
    display: grid;
    align-items: center;
    justify-items: center;
    opacity: 0.8;
    background-color: var(--spectrum-global-color-gray-300);
    border: 1px solid var(--spectrum-global-color-gray-300);
    transition: all 130ms ease-in-out;
  }

  .superBadge:hover {
    opacity: 1;
    filter: drop-shadow(5px 5px 6px #00000050);
    border: 1px solid var(--spectrum-global-color-gray-400);
  }
</style>
