<script>
  import { getContext } from "svelte";
  import { findComponentById } from "../lib/builderHelpers";
  import FieldSelect from "./FieldSelect.svelte";
  import {
    SuperTableColumn,
    defaultOperatorMap,
  } from "@poirazis/supercomponents-shared";

  const { styleable, builderStore, screenStore, memo } = getContext("sdk");
  const component = getContext("component");
  const stbSettings = getContext("stbSettings");
  const stbSchema = getContext("stbSchema");
  const stbData = getContext("stbData");

  export let field;
  export let columnType;
  export let datasource;
  export let valueColumn;
  export let labelColumn;
  export let optionsSource;
  export let customOptions;
  export let useOptionColors;
  export let useOptionIcons;
  export let optionsViewMode;

  export let valueTemplate;

  export let sizing;
  export let flexFactor;
  export let minWidth;
  export let maxWidth;
  export let fixedWidth;

  export let canResize;
  export let canEdit;
  export let canFilter;
  export let canSort;

  export let header, align;

  export let rowFontColor, rowBackground, fontWeight;

  export let footerTemplate;

  let id = $component.id;
  let order, isLast, isFirst;
  let localField = field;
  let columnOptions = memo({});
  let optionOverrides = memo({ ...$$props });

  $: optionOverrides.set({ ...$$props });
  $: inBuilder = $builderStore?.inBuilder;

  // We nned to know the position of the Super Columns amonsgt other siblings
  // to adjust various properties
  $: getOrderAmongstSiblings($screenStore);
  $: validField = isValid(field, $stbSchema);
  $: enrichColumnnOptions($stbSettings, field, $optionOverrides, $stbSchema);

  const enrichColumnnOptions = () => {
    let schema = $stbSchema;

    if (field && schema && schema[field]) {
      let type = schema[field]?.type;

      const flexible =
        sizing == "inherit"
          ? $stbSettings.columnSizing == "flexible"
          : $optionOverrides.sizing == "flexible";

      columnOptions.set({
        name: field,
        schema: columnType == "auto" ? schema[field] : { type: columnType },
        align: align,
        displayName: header ? header : field,
        asComponent: $builderStore.inBuilder,
        color: rowFontColor,
        background: rowBackground,
        fontWeight: fontWeight,
        header: header ?? "",
        headerAlign: align,
        headerHeight: $stbSettings?.appearance?.headerHeight,
        template: valueTemplate,
        canEdit:
          canEdit == "inherit" ? $stbSettings?.features.canEdit : canEdit,
        highlighters: $stbSettings?.appearance?.highlighters,
        canFilter:
          canFilter == "inherit" ? $stbSettings.features.canFilter : canFilter,
        canResize:
          canResize == "inherit" ? $stbSettings.features.canResize : canResize,
        defaultFilteringOperator: field ? defaultOperatorMap[type] : undefined,
        canSort: canSort == "inherit" ? $stbSettings.features.canSort : canSort,
        isSorted:
          $stbSettings?.sortedColum == field
            ? $stbSettings?.sortedDirection
            : null,
        sizing: flexible ? "flexible" : "fixed",
        minWidth: flexible
          ? $optionOverrides.minWidth || $stbSettings?.columnMinWidth
          : $optionOverrides.fixedWidth,
        maxWidth: flexible
          ? $optionOverrides.maxWidth || $stbSettings?.columnMaxWidth || "none"
          : $optionOverrides.fixedWidth,
        fixedWidth:
          $optionOverrides.fixedWidth || $stbSettings?.columnFixedWidth,
        showHeader: $stbSettings?.showHeader,
        showFooter: $stbSettings?.showFooter,
        footerTemplate,
        order: order,
        isFirst: isFirst,
        isLast: isLast,
        superColumn: true,
        cellPadding: $stbSettings?.appearance.cellPadding,
        optionsSource: columnType != "auto" ? optionsSource : "schema",
        customOptions,
        useOptionColors,
        useOptionIcons,
        optionsViewMode,
        data: {
          datasource,
          limit: 10,
          labelColumn,
          valueColumn,
        },
      });
    }
  };

  // When the Super Columns is used as a Component, the sizing variables need to be applied to the wrapping div and not the
  // SuperColumn itself.

  $: $component.styles = {
    ...$component.styles,
    normal: {
      ...$component.styles.normal,
      display: inBuilder ? "flex" : "contents",
      flex:
        $columnOptions.sizing == "flexible" ? flexFactor + " 1 auto" : "none",
      width:
        $columnOptions.sizing == "fixed" ? $columnOptions.fixedWidth : "auto",
      "min-width":
        $columnOptions.sizing == "flexible"
          ? $columnOptions.minWidth
          : $columnOptions.fixedWidth,
      "max-width":
        $columnOptions.sizing == "flexible"
          ? $columnOptions.maxWidth || "none"
          : $columnOptions.fixedWidth,
    },
  };

  $: if (
    inBuilder &&
    $component.selected &&
    stbSettings &&
    localField != field
  ) {
    builderStore.actions.updateProp("field", localField);
  }

  $: if (inBuilder && $component.selected && !stbSettings && field) {
    builderStore.actions.updateProp("field", undefined);
  }

  function getOrderAmongstSiblings() {
    if (!stbSettings) return;

    let parentTableID = $stbSettings.componentID;
    let parentTableObj = findComponentById(
      $screenStore.activeScreen.props,
      parentTableID
    );
    order = parentTableObj?._children?.findIndex((v) => v._id == id);
    isLast = order == parentTableObj?._children?.length - 1;
    isFirst = order == 0;
  }

  const isValid = () => {
    if (!stbSchema) return true;

    let validFields = Object.keys($stbSchema ?? []);
    return field && validFields.includes(field);
  };

  $: console.log($optionOverrides);
</script>

<div
  class="super-column-wrapper"
  class:in-builder={inBuilder}
  class:invalid={!validField}
  class:error={!$stbSchema && inBuilder}
  use:styleable={$component.styles}
>
  {#if !$stbSchema && inBuilder}
    <div class="error-message">
      <i
        class="ri-error-warning-line"
        style="color: var(--spectrum-global-color-yellow-700)"
      ></i>
      Super Columns can only be placed inside a Super Table
    </div>
  {:else if $stbSchema && !validField && inBuilder}
    <FieldSelect bind:value={localField} schema={$stbSchema} />
  {:else if validField}
    <SuperTableColumn
      {stbData}
      columnOptions={{ ...$columnOptions, hasChildren: $component.children }}
    >
      <slot></slot>
    </SuperTableColumn>
  {/if}
</div>

<style>
  .super-column-wrapper {
    display: contents;
  }

  .super-column-wrapper.in-builder {
    display: flex;
  }

  .super-column-wrapper.invalid {
    width: 10rem;
    border: 1px dashed var(--spectrum-global-color-blue-400);
  }

  .super-column-wrapper.error {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    border: 1px dashed var(--spectrum-global-color-red-400);
  }
</style>
