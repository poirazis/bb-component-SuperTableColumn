<script>
  import { getContext, onDestroy, onMount, createEventDispatcher, setContext } from "svelte";
  import { v4 as uuidv4 } from "uuid";
  import { writable, derived } from "svelte/store";
  import fsm from "svelte-fsm";

  import SuperColumnHeader from "./parts/SuperColumnHeader.svelte";
  import SuperColumnBody from "./parts/SuperColumnBody.svelte";
  import SuperColumnFooter from "./parts/SuperColumnFooter.svelte";

  const tableDataStore = getContext("tableDataStore");
  const tableStateStore = getContext("tableStateStore");
  const tableFilterStore = getContext("tableFilterStore");
  const tableHoverStore = getContext("tableHoverStore");

  const { builderStore } = getContext("sdk");
  const dispatch = createEventDispatcher();
  
  // Props
  export let columnOptions;
  export let tableState
  export let tableOptions;

  // Allow the Super Table to bind to the Super Column State Machine to control it
  export const columnState = fsm("Idle", {
    "*": {
      tableState( state ) { if ( state == "Loading") { return "Loading" } else return "Idle" }
    },
    Idle: { 
      sort () { $tableDataStore.sortColumn = enrichedColumnOptions.name; return "Ascending"; } , 
      filter () { return enrichedColumnOptions.canFilter ? "Entering" : "Idle" },
    },
    Loading :{ 
      loaded() { return "Idle" } 
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
      filter( operator , value ) { if ( value && value.length > 0 ) { setFilter(operator , value ); return "Filtered" } },
      cancel() { return "Idle" }
    },
    Resizing: { stop: () => { return "Idle" } },
    Dragging: { stop: () => { return "Idle" } },
    EditingCell: { stop: () => { return "Idle" } },
    Filtered: { 
      filter(operator, value) { value != "" && value.length > 0 ? setFilter(operator,value) : this.clear() },
      clear() { console.log("Clearing");  return "Entering" },
      cancel() {  filterValue = undefined; tableFilterStore?.clearFilter({ id: id });return "Idle" } 
      }
  });

  // Internal Variables
  let id = uuidv4();
  let enrichedColumnOptions 
  let resizing = false
  let considerResizing = false
  let startPoint 
  let startWidth
  let width
  let column
  let filterValue
  let filterOperator

  $: filterValue != undefined && filterOperator ? columnState.filter ( filterOperator , filterValue ) : null 
  $: columnState.tableState($tableState)

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
      "id": id,
      "schema" : $tableDataStore.schema[columnOptions.name] ?? {},
      "sizing": columnOptions.width ? "fixed" : tableOptions.columnSizing,
      "width": columnOptions.width ? columnOptions.width : tableOptions.columnWidth,
      "maxWidth": tableOptions.columnMaxWidth,
      "showFooter": tableOptions.showFooter,
      "showHeader": tableOptions.showHeader,
      "canEdit": tableOptions.canEdit,
      "canEdit": tableOptions.canEdit,
      "canFilter": tableOptions.canFilter
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
    let column = tableOptions.columns.findIndex( (col) => ( col.name == columnOptions.name) ) 
    if ( column > -1 ) {
      let newColumns = [ ...tableOptions.columns ]
      newColumns[column].width = width
      dispatch("saveSettings", newColumns )
    }
  }

  function initializeColumn(field) {
    if (!field) return;

    tableDataStore?.unregisterColumn({ id: id, field: field });
    tableDataStore?.registerColumn({ id: id, field: field });
  }

  onDestroy( () => tableDataStore?.unregisterColumn({ id: id, field: columnOptions.name }) );
  onMount( () => startWidth = column ? column.clientWidth : null )

  $: console.log("Column Enriched  :", enrichedColumnOptions)
  let columnOptionsStore = new writable({})
  setContext ("superColumnOptions", columnOptionsStore );

  $: $columnOptionsStore = enrichedColumnOptions

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
  style:max-width={ width ? width : enrichedColumnOptions.sizing == "fixed" ? enrichedColumnOptions.width : enrichedColumnOptions.maxWidth }
  style:--super-cell-control-width={ width ?? startWidth }
  style:--super-column-bgcolor={ enrichedColumnOptions.backgroundColor }
  style:--super-column-color={enrichedColumnOptions.color}
  style:--super-column-alignment={enrichedColumnOptions.align == "Right"
    ? "flex-end"
    : enrichedColumnOptions.align == "Center"
    ? "center"
    : "flex-start"}
  bind:this={column}
  on:mouseleave={() => ($tableHoverStore = null)}
>

  {#if columnOptions.superColumn && $builderStore.inBuilder }
    <div class="superBadge">⚡️</div>
  {/if}

  <div 
    class="grabber" 
    on:mousedown={ startResizing }
    on:dblclick={ resetSize }
    on:mouseenter={ () => ( considerResizing = true ) } on:mouseleave={ () => ( considerResizing = false ) } /> 

  {#if enrichedColumnOptions.showHeader}
    <SuperColumnHeader bind:filterValue bind:filterOperator {columnState} {enrichedColumnOptions} {width} />
  {/if}

  <SuperColumnBody {columnState} {enrichedColumnOptions} {width} rows={$columnStore}>
    <slot />
  </SuperColumnBody>

  {#if enrichedColumnOptions.showFooter }
    <SuperColumnFooter>{enrichedColumnOptions.displayName}</SuperColumnFooter>
  {/if}
</div>

<style>
  .superTableColumn {
    flex: 1 1 auto;
    position: relative;
    border-right: var(--super-table-vertical-dividers);
    color: var(--super-table-color);
    display: flex;
    flex-direction: column;
    align-items: stretch;  
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
