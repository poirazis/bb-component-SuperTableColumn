<script>
  import { getContext, setContext } from "svelte";
  import { writable, derived } from "svelte/store"
  import { SuperTableColumn } from "../lib/SuperTableColumn/index.js";

  import { findComponentById } from "../lib/builderHelpers" 

  const { styleable, builderStore, screenStore } = getContext("sdk");

  const component = getContext("component");

  const tableDataStore = getContext("tableDataStore")

  // We keep a hidden property of type "schema" so we can use the "field" property type
  export let field
  export let icon 

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
  let order, isLast, isFirst

  let nested = false;

  $: columnOptions = {
    name: field,
    displayName: header ? header : field, 
    hasChildren: $component.children > 0,
    asComponent: $builderStore.inBuilder
  }
  
  // Component Code 
  let nameStore = writable()
  $: nameStore.set(field)

  // Create our derived store and make sure we grab only the selected field rows.
  // If the field changes, the store will update to reflect the change
  let columnStore = derived( 
      [tableDataStore, nameStore], 
        ( [$tableDataStore, $nameStore] ) => { return $tableDataStore?.data.map( row => ({ rowKey: row[$tableDataStore.idColumn], rowValue:row[$nameStore]  }) )  } 
      ) || null


  // Reinitialize when another field is selεcted or after a DND 
  $: getOrderAmongstSiblings( $screenStore )

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


  function getOrderAmongstSiblings ( ) {
    if (!tableDataStore) return

    let parentTableID = $tableDataStore?._parentID
    let parentTableObj = findComponentById ( $screenStore.activeScreen.props, parentTableID )
    order = parentTableObj?._children?.findIndex ( v => v._id == id )
    isLast = order == parentTableObj?._children?.length - 1
    isFirst = order == 0  
  }
</script>

<div class="spectrum-Table" use:styleable={styles}>

  { #if !tableDataStore || !columnStore }
    <p> Super Table Column can olny be placed inside a Super Table </p>
  {:else if nested }
    <p> Super Columns cannot be nested </p>
  {:else}
    <SuperTableColumn {columnOptions} > 
      <slot />
    </SuperTableColumn>
  {/if}

</div>