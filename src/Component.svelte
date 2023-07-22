<script>
  // Budibase Minimum
  const component = getContext("component");
  import { getContext } from "svelte";
  const { styleable, builderStore, screenStore } = getContext("sdk");

  // SuperTable Component
  import { SuperTableColumn } from "../lib/SuperTableColumn/index.js";
  import { findComponentById } from "../lib/builderHelpers" 
  const tableDataStore = getContext("tableDataStore")

  // We keep a hidden property of type "dataprovider" so we can use the "field" property type
  export let dataProvider 
  export let field

  export let icon 
  export let columnWidth
  export let minWidth
  export let resizable
  export let editable
  export let filtering
  export let sorting
  export let searchMode

  export let header, headerAlign, headerFontColor, headerBackground;
  export let rowHorizontalAlign, rowVerticalAlign, rowFontColor, rowBackground;
  export let footer, footerAlign, footerFontColor, footerBackground;

  let id = $component.id;
  let order, isLast, isFirst
   
  // We nned to know the position of the Super Columns amonsgt other siblings
  // to adjust various properties
  $: getOrderAmongstSiblings( $screenStore )
  function getOrderAmongstSiblings ( ) {
    if (!tableDataStore ) return;

    let parentTableID = $tableDataStore?._parentID
    let parentTableObj = findComponentById ( $screenStore.activeScreen.props, parentTableID )
    order = parentTableObj?._children?.findIndex ( v => v._id == id )
    isLast = order == parentTableObj?._children?.length - 1
    isFirst = order == 0  
  }
  
  $: columnOptions = {
    name: field,
    displayName: header ? header : field, 
    hasChildren: $component.children > 0,
    asComponent: $builderStore.inBuilder,
    header: header ?? "",
    editable: editable,
    filtering: filtering,
    sorting: sorting,
    order: order,
    isFirst: isFirst,
    isLast: isLast 
  }
</script>

<div class="superColumnWrapper" use:styleable={$component.styles}>
  { #if !tableDataStore }
    <p> Super Table Column can olny be placed inside a Super Table </p>
  {:else}    
    <SuperTableColumn {columnOptions} > <slot /> </SuperTableColumn>
  {/if}
</div>

<style>
  .superColumnWrapper {
    flex: auto;
  }
</style>