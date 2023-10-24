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

  const dispatch = createEventDispatcher();
  
  // Props
  export let columnOptions;
  export let tableState
  export let tableOptions;

  // Allow the Super Table to bind to the Super Column State Machine to control it
  export const columnState = fsm("Idle", {
    "*": {
      tableState( state ) { if ( state == "Loading") { return "Loading" } else return "Idle" },
      cancel() { return "Idle"}
    },
    Idle: { 
      sort () { $tableDataStore.sortColumn = columnOptions.name; return "Ascending"; } , 
      filter () { return columnOptions.canFilter ? "Entering" : "Idle" },
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
        filter( filterObj ) { 
          tableState.setFilter( { ...filterObj, id: id } )  
          return "Filtered" },
      cancel() { return "Idle" }
    },
    Resizing: { stop: () => { return "Idle" } },
    Dragging: { stop: () => { return "Idle" } },
    EditingCell: { stop: () => { return "Idle" } },
    Filtered: { 
      filter( filterObj ) { tableState.setFilter( { ...filterObj, id: id } ) },
      clear() { tableFilterStore?.clearFilter({ id: id }); return "Entering" },
      cancel() { this.clear(); return "Idle" }
    }
  });

  // Internal Variables
  let id = uuidv4();
  let resizing = false
  let considerResizing = false
  let startPoint 
  let startWidth
  let width
  let column
  let columnOptionsStore = new writable({})

  $: columnState.tableState($tableState)

  // Reactive declaration.
  // nameStore is used in our derived store that holds the column data
  let nameStore = writable(columnOptions.name);
  $: nameStore.set(columnOptions.name);
  let columnStore =
    derived([tableDataStore, nameStore], ([$tableDataStore, $nameStore]) => {
      return $tableDataStore?.data.map((row) => ({
        rowKey: row[$tableDataStore.idColumn],
        rowValue: row[$nameStore],
      }));
    }) || null;

  $: if (
    $tableDataStore.sortColumn !== columnOptions.name &&
    $columnState != "Idle"
  ) {
    columnState.unsort();
  }

  $: if (!columnOptions.hasChildren) { tableStateStore?.removeRowHeights(id); }
  $: initializeColumn(columnOptions.name);
  $: tableDataStore?.updateColumn({ id: id, field: columnOptions.name });

  // Pass Context to possible Super Table Cell Component Children
  $: $columnOptionsStore = columnOptions
  setContext ("superColumnOptions", columnOptionsStore );
  
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
</script>

<svelte:window
  on:mouseup={ (e) => { if ( resizing ) stopResizing(e) } } 
  on:mousemove={ (e) => { if ( resizing ) resize(e) } }
  />

<div
  bind:this={column}
  class="superTableColumn"
  class:resizing
  class:considerResizing={considerResizing && !resizing}
  style:flex={ columnOptions.sizing == "fixed" ? "0 0 auto" : "1 0 auto" }
  style:width={ columnOptions.sizing == "fixed" ? columnOptions.fixedWidth : "auto"}
  style:min-width={ columnOptions.sizing == "flexible" ? columnOptions.minWidth : null}
  style:max-width={ columnOptions.sizing == "flexible" ? columnOptions.maxWidth : null}
  on:mouseleave={() => ($tableHoverStore = null)}
>
  <div 
    class="grabber" 
    on:mousedown={ startResizing }
    on:dblclick={ resetSize }
    on:mouseenter={ () => ( considerResizing = true ) } on:mouseleave={ () => ( considerResizing = false ) } 
  /> 

  <SuperColumnHeader {columnState} {columnOptions} />

  <SuperColumnBody {columnState} {columnOptions} rows={$columnStore}>
    <slot />
  </SuperColumnBody>

  <SuperColumnFooter {columnState} {columnOptions} />
</div>

<style>
  .superTableColumn {
    position: relative;
    border-right: var(--super-table-vertical-dividers);
    color: var(--super-table-color);
    display: flex;
    flex-direction: column;
    align-items: stretch;  
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
</style>