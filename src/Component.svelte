<script>
  import { getContext } from "svelte";
  import { SuperTableColumn } from "../lib/SuperTableColumn/index.js";
  import { findComponentById } from "../lib/builderHelpers" 

  const { styleable, builderStore, screenStore } = getContext("sdk");
  const component = getContext("component");
  const tableOptions = getContext("tableOptionStore")
  const tableState = getContext("tableState")

  // We keep a hidden property of type "dataprovider" so we can use the "field" property type
  export let dataProvider 
  export let field

  export let valueTemplate

  export let sizing
  export let flexFactor
  export let minWidth
  export let maxWidth
  export let fixedWidth

  export let canResize
  export let canEdit
  export let canFilter
  export let canSort

  export let icon
  export let iconColor

  export let header, headerAlign, headerFontColor, headerBackground;

  export let rowHorizontalAlign, rowFontColor, rowBackground, fontWeight;

  export let footer, footerAlign, footerFontColor, footerBackground;

  let id = $component.id;
  let order, isLast, isFirst
   
  // We nned to know the position of the Super Columns amonsgt other siblings
  // to adjust various properties
  $: getOrderAmongstSiblings( $screenStore )
  $: columnOptions = {
    name: field,
    align: rowHorizontalAlign,
    displayName: header ? header : field, 
    hasChildren: $component.children > 0,
    asComponent: $builderStore.inBuilder,
    color: rowFontColor,
    background: rowBackground,
    fontWeight: fontWeight,
    header: header ?? "",
    template: valueTemplate,
    canEdit: canEdit,
    canFilter: canFilter,
    canSort: canSort,
    sizing: sizing,
    minWidth: minWidth,
    maxWidth: maxWidth,
    fixedWidth: fixedWidth,
    order: order,
    isFirst: isFirst,
    isLast: isLast,
    superColumn: true
  }

  // When the Super Columns is used as a Component, the sizing variables need to be applied to the wrapping div and not the 
  // SuperColumn itself.
  $: $component.styles = {
    ...$component.styles,
    normal: {
      ...$component.styles.normal,
      "flex": $tableOptions?.columnSizing == "flexible" && sizing == "flexible" ? flexFactor + " 1 auto" : "0 0 auto",
      "width" : sizing == "fixed" || $tableOptions?.columnSizing == "fixed" 
        ? fixedWidth ? fixedWidth : $tableOptions?.columnFixedWidth 
        ? $tableOptions?.columnFixedWidth : "auto"
        : "auto",
      "min-width" : sizing == "flexible" && minWidth ? minWidth : "auto",
      "max-width" : sizing == "flexible" && $tableOptions?.columnSizing == "flexible" ? maxWidth ? maxWidth : $tableOptions.columnMaxWidth : "auto",
    }
  }

  function getOrderAmongstSiblings ( ) {
    if (!tableOptions ) return;

    let parentTableID = $tableOptions.componentID;
    let parentTableObj = findComponentById ( $screenStore.activeScreen.props, parentTableID )
    order = parentTableObj?._children?.findIndex ( v => v._id == id )
    isLast = order == parentTableObj?._children?.length - 1
    isFirst = order == 0  
  }
</script>

<div use:styleable={$component.styles}>
  {#if !tableOptions }
    <p> Super Column can olny be placed inside a Super Table </p>
  {:else}   
    <SuperTableColumn 
      {columnOptions} 
      tableOptions={$tableOptions} 
      {tableState}> 
        <slot /> 
    </SuperTableColumn>
  {/if}
</div>