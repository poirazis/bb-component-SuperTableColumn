<script>
  import { getContext } from "svelte";
  import { SuperTableColumn } from "../../bb_super_components_shared/src/lib"
  import FieldSelect from "./FieldSelect.svelte"
  import { findComponentById } from "../lib/builderHelpers" 

  const { styleable, builderStore, screenStore, componentStore } = getContext("sdk");
  const component = getContext("component");
  const tableOptions = getContext("tableOptionStore")
  const tableState = getContext("tableState")

  export let columnType
  export let superProps = "{}"
  export let tableId
  export let foreignKey
  export let labelColumn

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
  let props = {}

  $: try { props = JSON.parse(superProps) } catch { props = {} }
  $: props.field = tableOptions && Object.keys($tableOptions?.data.schema).includes(props.field) ? props.field : ""
  $: field = props.field

  // Keep the datasource prop in sync with the parent table 
  $: if ( $builderStore.inBuilder 
          && $componentStore.selectedComponentPath?.includes($component.id)
          && superProps != JSON.stringify(props)
      ) {
        builderStore.actions.updateProp("superProps", JSON.stringify(props))
      }
  

  // We nned to know the position of the Super Columns amonsgt other siblings
  // to adjust various properties
  $: getOrderAmongstSiblings( $screenStore )
  $: columnOptions = {
    name: field,
    schema: columnType == "link" ? { 
      relationshipType: "one-to-many",
      type : "link", 
      tableId : tableId.tableId, 
      labelColumn: labelColumn,
      foreignKey }
       : $tableOptions?.data.schema[field] ?? { "type" : "string" },
    type: columnType,
    align: rowHorizontalAlign,
    displayName: header ? header : field, 
    hasChildren: $component.children > 0,
    asComponent: $builderStore.inBuilder,
    color: rowFontColor,
    background: rowBackground,
    fontWeight: fontWeight,
    header: header ?? "",
    headerAlign: headerAlign,
    template: valueTemplate,
    canEdit: canEdit,
    canFilter: canFilter,
    canSort: canSort,
    isSorted: $tableOptions?.sortedColum == field ? $tableOptions?.sortedDirection : null,
    sizing: sizing,
    minWidth: minWidth,
    maxWidth: maxWidth,
    fixedWidth: fixedWidth,
    showHeader: true,
    order: order,
    isFirst: isFirst,
    isLast: isLast,
    superColumn: true,
    padding: $tableOptions?.appearance.cellPadding
  }

  // When the Super Columns is used as a Component, the sizing variables need to be applied to the wrapping div and not the 
  // SuperColumn itself.
  $: $component.styles = {
    ...$component.styles,
    normal: {
      ...$component.styles.normal,
      "display" : $builderStore.inBuilder ? "block" : "contents",
      "flex": $tableOptions?.columnSizing == "flexible" && sizing == "flexible" ? flexFactor + " 1 auto" : "0 0 auto",
      "width" : sizing == "fixed" || $tableOptions?.columnSizing == "fixed" 
        ? fixedWidth ? fixedWidth : $tableOptions?.columnFixedWidth 
        ? $tableOptions?.columnFixedWidth : "auto"
        : "auto",
      "min-width" : sizing == "flexible" && minWidth ? minWidth : "auto",
      "max-width" : sizing == "flexible" && $tableOptions?.columnSizing == "flexible" ? maxWidth ? maxWidth : $tableOptions?.columnMaxWidth : "auto",
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

  const isValid = () => {
    let validFields = Object.keys($tableOptions.data.schema) ?? []
    return field && validFields.includes(field)
  }
</script>

<div use:styleable={$component.styles}>
  {#if !tableOptions }
    <p> Super Column can olny be placed inside a Super Table </p>
  {:else if !props.field}
    Please Select Column : 
    <FieldSelect 
      schema={$tableOptions.data.schema}
      bind:value={props.field}
     />
  {:else}   
    <SuperTableColumn 
      {columnOptions} 
      {tableState}> 
        <slot /> 
    </SuperTableColumn>
  {/if}
</div>