<script>
  import { getContext, onMount, afterUpdate, onDestroy, setContext } from "svelte";

  import "../node_modules/@spectrum-css/table/dist/index-vars.css"

  import SuperTableHeader from "./lib/SuperTableHeader.svelte";
  import SuperTableColumnRow from "./lib/SuperTableColumnRow.svelte";
  import SuperTableFooter from "./lib/SuperTableFooter.svelte";
  import { findComponentById } from "./lib/builderHelpers" 

  const { styleable, builderStore, screenStore } = getContext("sdk");

  const component = getContext("component");
  const tableStore = getContext("tableStore");
  const tableSynchronizer = getContext("tableSynchronizer")
  const tableFilterStore = getContext("tableFilterStore")

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
  let columnStore = null
  let rowHeights = []
  let loaded = false
  let noRecords = false
  let order, isLast, isFirst

  // Builder Specific Code 
  // Set components hidden property Schema to the wrapping dataProviderd datasource
  // so the field property will populate the fields for the user to select
  $: if ( $builderStore?.inBuilder && (!field || !schema))  {
    initializeColumnBuilder();
  }
  
  // Scrolling Synchonicity Code 
  // Notify the tableSynchronizer that you have been scrolled
  let tableBodyContainer
  function handleScroll( e ) {
    if ( $tableSynchronizer.scrollY !== tableBodyContainer?.scrollTop )
    {
      $tableSynchronizer.controllerID = id
      $tableSynchronizer.scrollY = tableBodyContainer?.scrollTop 
    }
  } 

  // Do not update if you are the one who initiated the scroll 
  afterUpdate( () => { 
      if (tableBodyContainer && $tableSynchronizer.controllerID !== id  && tableBodyContainer?.scrollTop != $tableSynchronizer?.scrollY  ) {
        tableBodyContainer.scrollTop = $tableSynchronizer?.scrollY 
      }
    } 
  )

  // Component Code 
  $: if ( $tableStore?.loaded ) loaded = true
  // Reinitialize when another field is selεcted or after a DND 
  $: initializeColumn( field )
  $: getOrderAmongstSiblings($screenStore)
  $: if ( loaded && columnStore ) tableStore?.updateRowHeights(id, rowHeights)
  $: if ( loaded && columnStore && field ) tableStore?.updateColumn({ id: id, field: field });
  $: size = $tableStore?.size

  $: flexType =
    flexBasis == "auto"
      ? columnWidth + " " + columnWidth + " auto"
      : " 0 0 " + flexBasis;

  function generateStylingOverrides () {
    let styles = {}
    if (headerAlign != "inherit") styles["--super-table-header-horizontal-align"] = headerAlign
    if (headerFontColor) styles["--spectrum-table-m-regular-header-text-color"] = headerFontColor
    if (headerBackground) styles["--spectrum-table-m-regular-header-background-color"] = headerBackground

    if (rowBackground)  styles["--spectrum-table-m-regular-row-background-color"] = rowBackground
    if (rowVerticalAlign) styles["--super-table-row-vertical-align"] = rowVerticalAlign;
    if (rowHorizontalAlign) styles["--super-table-row-horizontal-align"] = rowHorizontalAlign
    if (rowFontColor) styles["--spectrum-table-m-regular-cell-text-color"] = rowFontColor

    if (footerAlign != "inherit")  styles["--super-table-footer-horizontal-align"] = footerAlign
    if (footerFontColor)  styles["--super-table-footer-font-color"] = footerFontColor
    if (footerBackground) styles["--super-table-footer-background-color"] = footerBackground
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
    $tableStore.sortColumn = field;
    $tableStore.sortDirection = event.detail.sortDirection;
  }

  function getOrderAmongstSiblings ( ) {
    if (!tableStore) return

    let parentTableID = $tableStore?._parentID
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
    tableStore?.unregisterColumn({ id: id, field: field })
    // Register the column to the tableStore, and get back a writable store
    columnStore = tableStore?.registerColumn({ id: id, field: field });
  }

  function initializeColumnBuilder() {
    if (!tableStore) return;

    // AutoSelect the schema if possible
    if ( !schema && $tableStore?.dataSource ) {
      builderStore.actions.updateProp("schema", $tableStore?.dataSource);
    }

    // AutoSelect the next unused field
    if (!field && $tableStore?.dataSource) {
      field = tableStore?.nextUnusedField();
      builderStore.actions.updateProp("field", field );
    } 
  }

  // Unregister from the tableStore
  onDestroy(() => tableStore?.unregisterColumn({ id: id, field: field }));

  // Set Context for Super Table Cell components
  let columnContext = { 
    parentID: $component?.id,
    field: field
   }
  setContext("SuperTableColumnInfo", columnContext );
</script>

<div class="spectrum-Table" use:styleable={styles}>
  { #if !tableStore || !columnStore }
    <p> Super Table Column can olny be placed inside a Super Table </p>
  {:else if $component.empty}
    <p> Add a component to show the contents </p>
    <p> Add a Super Table Cell for advanced functionality </p>
  {:else}
    <SuperTableHeader
      bind:flexBasis
      bind:isResizing={resizing}
      on:sort={handleSort}
      on:filter={handleFilter}
      {resizable}
      {searchable}
      {sortable}
      isSorted={sortable && $tableStore?.sortColumn === field}
    >
      {header || field}
    </SuperTableHeader>

    <div
      bind:this={tableBodyContainer} 
      on:scroll={handleScroll}
      class="spectrum-Table-body" 
      class:resizing={resizing}>

        {#each $columnStore?.rowData as row, index}
          <SuperTableColumnRow
            on:hovered={() => { if ( $tableSynchronizer.hoveredRow !== index ) $tableSynchronizer.hoveredRow = index} }
            on:unHovered={() => $tableSynchronizer.hoveredRow = null}
            bind:needHeight={rowHeights[index]}
            minHeight={$tableStore?.rowHeights[index]}
            rowKey={row.rowKey}
            cellValue={row.rowValue}
            loading={!loaded}
            isHovered={ $tableSynchronizer?.hoveredRow == index }
            isSelected={ $tableStore?.selectedRows.includes(row.rowKey) }
          >
          {#if noRecords}
            Not Found
          {:else}
              <slot />
          {/if}
          </SuperTableColumnRow>
        {/each}
    </div>
    <SuperTableFooter>{footer || field}</SuperTableFooter>
  {/if}
</div>

<style>
  .spectrum-Table-body {
    max-height: var(--super-table-body-height);
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    border-radius: 0px;
    overflow-y: scroll !important;
    overflow-x: hidden;
    padding: 0px;
    margin: 0px;
    border: unset;
  }

  .spectrum-Table-body.is-last-column::-webkit-scrollbar {
    display: block;
  }

  .spectrum-Table-body::-webkit-scrollbar {
    display: none;
  }
  .resizing {
    border-right: 1px dotted lime;
  }
</style>