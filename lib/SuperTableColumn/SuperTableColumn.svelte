<script>
  /**
   * The complete set of options that can be passed to a Super Column.
   * @typedef {Object} columnOptions
   * @property {Object} schema - The schema of the Cell ( as per Budibase Field Schema ). if Not set, the Cell will render as String
   * @property {string} mode - Can be Field / TableCell / or Unstyled
   * @property {string} state - The State of the Cell. Can be View / Edit / Disabled 
   * @property {string} placeholder - The Cell Placeholder Text
   * @property {string} align - Horizontal Alignment
   * @property {string} color - Use Font Color
   * @property {string} weight - Use Font Weight
   * @property {string} bgColor - The Background Color
   * @property {string} padding - The padding to be applied to the Cell
   * @property {boolean} hovered - To enter hovered state
   */

  import { getContext, onDestroy, onMount, setContext } from "svelte";
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
  
  // Props
  export let columnOptions;
  export let tableState
  export let tableOptions;

  // Internal Variables
  let id = uuidv4();
  let resizing = false
  let considerResizing = false
  let startPoint 
  let startWidth
  let width
  let column
  let columnOptionsStore = new writable({})
  let lockWidth = false

  // Allow the Super Table to bind to the Super Column State Machine to control it
  export const columnState = fsm( "Idle", {
    "*": {
      tableState( state ) { if ( state == "Loading") { return "Loading" } else return "Idle" },
      initializeColumn ( field ) {     
        if (!field) return;
        tableDataStore?.unregisterColumn({ id: id, field: field });
        tableDataStore?.registerColumn({ id: id, field: field });
      },
      rowClicked ( id ) { tableState.rowClicked( { "rowID" : id } ) },
      rowDblClicked ( id ) { tableState.rowDblClicked( { "rowID" : id } ) },
      cancel() { return "Idle"},
      lockWidth () { lockWidth = true },
      goTo ( state ) { return state },
      startResizing ( e ) { 
        e.preventDefault();
        e.stopPropagation();
        resizing = true;
        startPoint = e.clientX;
        startWidth = column.clientWidth
        width = startWidth
      },
      resize ( e ) {
        width = startWidth + e.clientX - startPoint
      },
      stopResizing ( e ) {
        e.preventDefault();
        e.stopPropagation();
        resizing = false;
        startPoint = undefined
      },
      resetSize ( e ) {
        e.preventDefault();
        e.stopPropagation();
        width = undefined;
      } 
    },
    Idle: { 
      sort () { return columnOptions.canSort ? "Ascending" : "Idle" }, 
      filter () { return columnOptions.canFilter ? "Entering" : "Idle" },
    },
    Loading :{ 
      loaded() { return "Idle" } 
    },
    Ascending: { 
      _enter () { tableState.sortBy( columnOptions.name, "Ascending" ); },
      sort () { return "Descending" }, 
      unsort: "Idle", 
      filter: "Entering" 
    },
    Descending: { 
      _enter() { tableState.sortBy( columnOptions.name, "Descending" ); },
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

  $: columnState.initializeColumn (columnOptions.name);

  $: if (!columnOptions.hasChildren) { tableStateStore?.removeRowHeights(id); }
  
  $: tableDataStore?.updateColumn({ id: id, field: columnOptions.name });
  $: if ($tableStateStore.sortedColumn == columnOptions.name ) {
    columnOptions["isSorted"] = $tableStateStore.sortedDirection
  }

  // Pass Context to possible Super Table Cell Component Children
  $: $columnOptionsStore = columnOptions
  setContext ("superColumnOptions", columnOptionsStore );

  onDestroy( () => tableDataStore?.unregisterColumn({ id: id, field: columnOptions.name }) );
  onMount( () => startWidth = column ? column.clientWidth : null )
</script>

<svelte:window
  on:mouseup={ ( e ) => { if ( resizing ) columnState.stopResizing( e ) } } 
  on:mousemove={ ( e ) => { if ( resizing ) columnState.resize( e ) } }
  />

<div
  bind:this={column}
  class="superTableColumn"
  class:resizing
  class:considerResizing={considerResizing && !resizing}
  style:flex={ width ? "0 0 auto" : columnOptions.sizing == "fixed" ? "0 0 auto" : "1 1 auto" }
  style:width={ width ? width : columnOptions.sizing == "fixed" ? columnOptions.fixedWidth : "auto"}
  style:min-width={ columnOptions.sizing == "flexible" ? columnOptions.minWidth : null}
  style:max-width={ columnOptions.sizing == "flexible" ? columnOptions.maxWidth : null}
  on:mouseleave={() => ($tableHoverStore = null)}
>
  <div 
    class="grabber" 
    on:mousedown={ columnState.startResizing }
    on:dblclick={ columnState.resetSize }
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