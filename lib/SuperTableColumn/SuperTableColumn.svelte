<script>
  import { getContext, onDestroy, setContext, beforeUpdate } from "svelte";
  import { writable, derived } from "svelte/store"

  import SuperColumnHeader from "./parts/SuperColumnHeader.svelte"
  import SuperColumnRow from "./parts/SuperColumnRow.svelte";
  import SuperColumnRowContainer from "./parts/SuperColumnRowContainer.svelte";
  import SuperColumnFooter from "./parts/SuperColumnFooter.svelte";

  const tableDataStore = getContext("tableDataStore")
  const tableStateStore = getContext("tableStateStore")
  const tableFilterStore = getContext("tableFilterStore")
  const tableSelectionStore = getContext("tableSelectionStore")
  const tableScrollPosition = getContext("tableScrollPosition")
  const tableOption = getContext("tableOptions")

  export let columnOptions
  export let columnWidth
  export let minWidth
  export let resizable
  export let sortable
  export let searchable
  export let searchMode

  let flexBasis = "auto";
  let resizing = false;
  let id = Math.random()

  $: if ( !columnOptions.hasChildren ) { 
      tableStateStore?.removeRowHeights ( id ) 
    }

  $: cellOptions = {
    paddingLeft: "12px",
    editable: false
  }
  
  // Component Code 
  let nameStore = writable()
  $: nameStore.set(columnOptions.name)
  $: field = columnOptions.name

  // Create our derived store and make sure we grab only the selected field rows.
  // If the field changes, the store will update to reflect the change
  let columnStore = derived( 
      [tableDataStore, nameStore], 
        ( [$tableDataStore, $nameStore] ) => { return $tableDataStore?.data.map( row => ({ rowKey: row[$tableDataStore.idColumn], rowValue:row[$nameStore]  }) )  } 
      ) || null


  // Reinitialize when another field is selεcted or after a DND 
  $: initializeColumn( columnOptions.name )
  $: tableDataStore?.updateColumn({ id: id, field: field });

  function handleSort(event) {
    $tableDataStore.sortColumn = field;
    $tableDataStore.sortDirection = event.detail.sortDirection;
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

  function initializeColumn( field ) {
    if ( !field ) return
    // unregister before registering to cover for in builder DND
    tableDataStore?.unregisterColumn({ id: id, field: field })
    // Register the column to the tableStore, and get back a writable store
    tableDataStore?.registerColumn({ id: id, field: field });
  }

  // Scrolling Synchonicity Code 
  // Notify the tableStateStore that you have been scrolled
  let tableBodyContainer
  function handleScroll( e ) {
    if (e.isTrusted) {
      
      $tableScrollPosition = tableBodyContainer?.scrollTop
    }
  } 
   
  beforeUpdate ( () => { if ( tableBodyContainer ) tableBodyContainer.scrollTop = $tableScrollPosition } )
  onDestroy( () => tableDataStore?.unregisterColumn({ id: id, field: field }))
  
  setContext("columnContext", { columnID: id, columnField: field, columnType: "string" } );
</script>

<div class="superTableColumn">

  { #if !tableDataStore || !columnStore }
    <p> Super Table Column can olny be placed inside a Super Table </p>
  {:else}
    <SuperColumnHeader
      bind:flexBasis
      bind:isResizing={resizing}
      on:sort={handleSort}
      on:filter={handleFilter}
      {resizable}
      {searchable}
      {sortable}
      scrolPos={tableBodyContainer?.scrollTop}
      isSorted={sortable && $tableDataStore?.sortColumn === field}
    >
      { columnOptions.asComponent ? "🚀" : "" }
      { columnOptions.displayName } 
    </SuperColumnHeader>

    {#if columnOptions.hasChildren }
      <div
        bind:this={tableBodyContainer} 
        on:scroll|preventDefault={handleScroll}
        class="spectrum-Table-body" 
        class:resizing={resizing}>

          {#each $columnStore as row, index }
            <SuperColumnRowContainer
            on:hovered={ () => tableStateStore.hoverRow( id, index ) }
            on:unHovered={ () => tableStateStore.unhoverRow() }
            on:rowClicked={ (e) => $tableStateStore.rowClicked = row.rowKey }
              on:resize={ (e) => { tableStateStore.resizeRow(id, index, e.detail.height ) } }
              minHeight={$tableStateStore?.rowHeights[index]}
              rowKey={row.rowKey}
              cellValue={row.rowValue ?? false}
              isHovered={ $tableStateStore?.hoveredRow == index || $tableStateStore.hoveredColumn == id }
              isSelected={ $tableSelectionStore[row.rowKey] }
            > 
              <slot />
            </SuperColumnRowContainer>
          {/each}
      </div>
    {:else}
      <div
      bind:this={tableBodyContainer} 
      on:scroll={handleScroll}
      class="spectrum-Table-body" 
      class:resizing={resizing}
      >
        {#each $columnStore as row, index }			
          <SuperColumnRow
            on:hovered={ () => tableStateStore.hoverRow( id, index ) }
            on:unHovered={ () => tableStateStore.unhoverRow() }
            on:rowClicked={ (e) => $tableStateStore.rowClicked = row.rowKey }
            {cellOptions}
            minHeight={$tableStateStore?.rowHeights[index]}
            rowKey={ row.rowKey }
            cellValue={ row.rowValue ?? "🌵 Field Doesnt Exist" }
            isHovered={ $tableStateStore?.hoveredRow == index || $tableStateStore.hoveredColumn == id }
            isSelected={ $tableSelectionStore[row.rowKey] } />
        {/each}
     </div>

    {/if}


    {#if columnOptions.showFooter }
      <SuperColumnFooter>{columnOptions.displayName}</SuperColumnFooter>
    {/if}
  {/if}
</div>

<style>
  .superTableColumn {
    flex: auto;
  }

  .spectrum-Table-body {
    max-height: var(--super-table-body-height);
    border-radius: 0px;
    overflow-y: scroll !important;
    overflow-x: hidden;
    padding: 0px;
    margin: 0px;
    border-left: unset;
    border-top: unset;
    border-bottom: unset;
    border-right-width: var(--super-table-column-right-border-size);
    scrollbar-width: none;  
  }

  .spectrum-Table-body::-webkit-scrollbar {
    display: none;
  }
  .resizing {
    border-right: 1px dotted lime;
  }
</style>