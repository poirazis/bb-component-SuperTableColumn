<script>
  import { getContext, onMount, onDestroy, setContext } from "svelte";
  import { writable, derived } from "svelte/store"


  import SuperColumnHeader from "./lib/SuperColumnHeader.svelte";
  import SuperColumnRow from "./lib/SuperColumnRow.svelte";
  import SuperColumnFooter from "./lib/SuperColumnFooter.svelte";

  import { findComponentById } from "./lib/builderHelpers" 
  const { styleable, builderStore, screenStore } = getContext("sdk");

  const component = getContext("component");
  const tableDataStore = getContext("tableDataStore")
  const tableThemeStore = getContext("tableThemeStore")
  const tableStateStore = getContext("tableStateStore")
  const tableFilterStore = getContext("tableFilterStore")
  const tableSelectionStore = getContext("tableSelectionStore")

  // We keep a hidden property of type "schema" so we can use the "field" property type
  export let schema;
  export let field
  export let size = "M"

  export let columnWidth
  export let minWidth
  export let resizable
  export let sortable
  export let searchable
  export let searchMode

  export let header, headerAlign, headerFontColor, headerBackground;
  export let rowHorizontalAlign, rowVerticalAlign, rowFontColor, rowBackground;
  export let footer, footerAlign, footerFontColor, footerBackground;

  let id = $component.id;
  let flexBasis = "auto";
  let resizing = false;
  let rowHeights = []
  let noRecords = false
  let order, isLast, isFirst
  let hasChildren = false
  let autoScroll = false

  $: hasChildren = $component.children > 0
  
  // Component Code 
  let nameStore = writable()
  $: nameStore.set(field)

  // Create our derived store and make sure we grab only the selected field rows.
  // If the field changes, the store will update to reflect the change
  let columnStore = derived( 
      [tableDataStore, nameStore], 
        ( [$tableDataStore, $nameStore] ) => { return $tableDataStore?.data.map( row => ({ rowKey: row[$tableDataStore.idColumn], rowValue:row[$nameStore]  }) )  } 
      ) || null


  // Reinitialize when another field is sel??cted or after a DND 
  $: initializeColumn( field )
  $: getOrderAmongstSiblings( $screenStore )
  $: tableStateStore?.updateRowHeights(id, rowHeights)
  $: tableDataStore?.updateColumn({ id: id, field: field });
  $: size = $tableDataStore?.size

  $: flexType =
    flexBasis == "auto"
      ? columnWidth + " " + columnWidth + " auto"
      : " 0 0 " + flexBasis;

  function generateStylingOverrides () {
    let styles = {}
    if (headerAlign != "inherit") styles["--super-table-header-horizontal-align"] = headerAlign
    if (headerFontColor) styles["--spectrum-table-header-text-color"] = headerFontColor
    if (headerBackground) styles["--spectrum-table-header-background-color"] = headerBackground

    if (rowBackground)  styles["--spectrum-table-row-background-color"] = rowBackground
    if (rowVerticalAlign != "inherit") styles["--super-table-row-vertical-align"] = rowVerticalAlign;
    if (rowHorizontalAlign != "inherit") styles["--super-table-row-horizontal-align"] = rowHorizontalAlign
    if (rowFontColor) styles["--spectrum-table-cell-text-color"] = rowFontColor

    if (footerAlign != "inherit")  styles["--super-table-footer-horizontal-align"] = footerAlign
    if (footerFontColor)  styles["--super-table-footer-font-color"] = footerFontColor
    if (footerBackground) styles["--super-table-footer-background-color"] = footerBackground

    // Hide right side divider if you are the last column
    if (isLast) styles["--super-table-column-right-border-size"] = "0px"
    return styles
  }

  // Ammend component styles with variable overrides
  $: styles = {
    ...$component.styles,
    normal: {
      ...$component.styles.normal,
      ...generateStylingOverrides(),
      flex: flexType,
    },
  };

  function handleSort(event) {
    $tableDataStore.sortColumn = field;
    $tableDataStore.sortDirection = event.detail.sortDirection;
  }

  function getOrderAmongstSiblings ( ) {
    if (!tableDataStore) return

    let parentTableID = $tableDataStore?._parentID
    let parentTableObj = findComponentById ( $screenStore.activeScreen.props, parentTableID )
    order = parentTableObj?._children?.findIndex ( v => v._id == id )
    isLast = order == parentTableObj?._children?.length - 1
    isFirst = order == 0  
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

  // Builder Specific Code 
  // Set components hidden property Schema to the wrapping dataProvider datasource
  // so the field property will populate the fields for the user to select
  function initializeColumnBuilder() {
    if (!tableDataStore) return;

    builderStore.actions.updateProp("schema", $tableDataStore?.dataSource);

    // AutoSelect the next unused field
    if (!field && $tableDataStore?.dataSource) {
      field = tableDataStore?.nextUnusedField();
      builderStore.actions.updateProp("field", field );
    } 
  }

  // Scrolling Synchonicity Code 
  // Notify the tableStateStore that you have been scrolled
  let tableBodyContainer
  function handleScroll( e ) {
    if ( $tableStateStore.scrollY !== tableBodyContainer?.scrollTop )
    {
      $tableStateStore.controllerID = id
      $tableStateStore.scrollY = tableBodyContainer?.scrollTop 
    }
  } 

  $: stateSynch($tableStateStore)

  function stateSynch ( ) {
    autoScroll = tableBodyContainer && $tableStateStore.controllerID !== id && (tableBodyContainer?.scrollTop != $tableStateStore?.scrollY) 
    if (autoScroll) tableBodyContainer.scrollTop = $tableStateStore?.scrollY  
  }


  onMount( () => { if ($builderStore?.inBuilder) initializeColumnBuilder() })
  onDestroy( () => tableDataStore?.unregisterColumn({ id: id, field: field }))

  setContext("columnContext", { columnID: id, columnField: field, columnType: "string" } );
</script>

<div class="spectrum-Table" use:styleable={styles}>
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
      isSorted={sortable && $tableDataStore?.sortColumn === field}
    >
      {header || field}
    </SuperColumnHeader>

    <div
      bind:this={tableBodyContainer} 
      on:scroll={handleScroll}
      class="spectrum-Table-body" 
      class:resizing={resizing}>

        {#each $columnStore as row, index }
          <SuperColumnRow
            on:hovered={ () => { if ( $tableStateStore.hoveredRow !== index ) $tableStateStore.hoveredRow = index} }
            on:unHovered={ () => $tableStateStore.hoveredRow = null}
            on:rowClicked={ (e) => $tableStateStore.rowClicked = row.rowKey }
            bind:needHeight={rowHeights[index]}
            minHeight={$tableStateStore?.rowHeights[index]}
            rowKey={row.rowKey}
            cellValue={row.rowValue ?? false}
            isHovered={ $tableStateStore?.hoveredRow == index }
            isSelected={ $tableSelectionStore[row.rowKey] }
            {hasChildren}
          >
            <slot />
          </SuperColumnRow>
        {/each}
    </div>
    {#if $tableThemeStore.showFooter}
      <SuperColumnFooter>{footer || field}</SuperColumnFooter>
    {/if}
  {/if}
</div>

<style>
  .spectrum-Table-body {
    max-height: var(--super-table-body-height);
    flex: 0 0;
    display: flex;
    flex-direction: column;
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