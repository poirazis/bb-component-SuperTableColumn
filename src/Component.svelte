<script>
  import { getContext } from "svelte";
  import { findComponentById } from "../lib/builderHelpers" 
  import FieldSelect from "./FieldSelect.svelte"
  import SuperTableColumn from "../../bb_super_components_shared/src/lib/SuperTableColumn/SuperTableColumn.svelte";
  import { defaultOperatorMap } from "../../bb_super_components_shared/src/lib/SuperTable/constants";

  const { styleable, builderStore, screenStore, componentStore } = getContext("sdk");
  const component = getContext("component");
  const tableOptions = getContext("stbSettings")
  const stbState = getContext("tableState")
  const stbData = getContext("stbData")

  export let field
  export let columnType
  export let datasource
  export let valueColumn
  export let labelColumn
  export let fullTable
  export let columnList
  export let optionsSource
  export let customOptions
  export let useOptionColors
  export let useOptionIcons
  export let optionsViewMode

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
  let order, isLast, isFirst, localField

  // We nned to know the position of the Super Columns amonsgt other siblings
  // to adjust various properties
  $: getOrderAmongstSiblings( $screenStore )
  $: columnOptions = {
    name: field,
    schema: columnType == "auto" ? $stbData?.schema[field] : { type: columnType },
    type: columnType,
    align: rowHorizontalAlign,
    displayName: header ? header : field, 
    asComponent: $builderStore.inBuilder,
    color: rowFontColor,
    background: rowBackground,
    fontWeight: fontWeight,
    header: header ?? "",
    headerAlign: headerAlign,
    headerHeight: $tableOptions?.headerHeight,
    template: valueTemplate,
    canEdit: canEdit == "inherit" ? $tableOptions?.features.canEdit : canEdit,
    highlighters : $tableOptions.appearance.highlighters,
    canFilter: canFilter == "inherit" ? $tableOptions.features.canFilter : canFilter,
    canResize: canResize == "inherit" ? $tableOptions.features.canResize : canResize,
    defaultFilteringOperator: field ? defaultOperatorMap[$stbData?.schema[field].type] : undefined,
    canSort: canSort == "inherit" ? $tableOptions.features.canSort : canSort,
    isSorted: $tableOptions?.sortedColum == field ? $tableOptions?.sortedDirection : null,
    sizing: sizing || $tableOptions?.sizing,
    minWidth: minWidth || $tableOptions?.columnMinWidth,
    maxWidth: maxWidth || $tableOptions?.columnMaxWidth,
    fixedWidth: fixedWidth | $tableOptions?.columnFixedWidth,
    showHeader: $tableOptions?.showHeader,
    showFooter: $tableOptions?.showFooter,
    order: order,
    isFirst: isFirst,
    isLast: isLast,
    superColumn: true,
    cellPadding: $tableOptions?.appearance.cellPadding,
    optionsSource: columnType != "auto" ? optionsSource : "schema",
    customOptions,
    useOptionColors,
    useOptionIcons,
    optionsViewMode,
    data : {
      datasource,
      limit: 10,
      labelColumn,
      valueColumn,
      fullTable,
      columnList
    }
  }

  // When the Super Columns is used as a Component, the sizing variables need to be applied to the wrapping div and not the 
  // SuperColumn itself.
  $: $component.styles = {
    ...$component.styles,
    normal: {
      ...$component.styles.normal,
      "display" : $builderStore.inBuilder ? "block" : "contents",
      "flex": $tableOptions?.columnSizing == "flexible" && sizing == "flexible" ? flexFactor + " 1 auto" : "0 1 auto",
      "width" : columnOptions.sizing == "fixed" ? columnOptions.fixedWidth : "auto",
      "min-width" : columnOptions.minWidth,
      "max-width" : columnOptions.maxWidth,
    }
  }

  $:  if (
      $builderStore.inBuilder &&
      $componentStore.selectedComponentPath?.includes($component.id) &&
      localField && 
      localField != field
    ) {
        builderStore.actions.updateProp("field", localField)
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
    let validFields = Object.keys($stbData?.schema ?? {} )
    return field && validFields.includes(field)
  }

</script>

<div use:styleable={$component.styles}> 
  {#if !tableOptions}
    <p> Super Columns can only be placed inside a Super Table </p>
  {:else if !isValid(field)}
    <div style:margin={"0.5rem 1rem"} >
      <FieldSelect bind:value={localField} schema={$stbData?.schema ?? {} } />
    </div>
  {:else}
    <SuperTableColumn 
      {columnOptions} 
      {stbState}> 
        <slot /> 
    </SuperTableColumn>
  {/if}
</div>