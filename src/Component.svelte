<script>
  import { getContext } from "svelte";
  import { findComponentById } from "../lib/builderHelpers";
  import FieldSelect from "./FieldSelect.svelte";
  import SuperTableColumn from "../../bb_super_components_shared/src/lib/SuperTableColumn/SuperTableColumn.svelte";
  import { defaultOperatorMap } from "../../bb_super_components_shared/src/lib/SuperTable/constants";

  const { styleable, builderStore, screenStore, memo } = getContext("sdk");
  const component = getContext("component");
  const stbSettings = getContext("stbSettings");

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

  export let footerTemplate, footerAlign, footerFontColor, footerBackground;

  let id = $component.id;
  let order, isLast, isFirst;
  let localField = $stbSettings ? field : "reset_this_column";
  let columnOptions = memo({});
  let optionOverrides = memo($$props);

  $: optionOverrides.set($$props);
  $: inBuilder = $builderStore?.inBuilder;
  $: schema = $stbSettings?.data?.schema;

  // We nned to know the position of the Super Columns amonsgt other siblings
  // to adjust various properties
  $: getOrderAmongstSiblings($screenStore);
  $: enrichColumnnOptions($stbSettings, field, $optionOverrides);

  const enrichColumnnOptions = () => {
    if (field && schema && schema[field]) {
      let schema = $stbSettings?.data?.schema;
      let type = schema[field]?.type;

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
        headerHeight: $stbSettings?.headerHeight,
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
        sizing: sizing || $stbSettings?.sizing,
        minWidth: minWidth || $stbSettings?.columnMinWidth,
        maxWidth: maxWidth || $stbSettings?.columnMaxWidth,
        fixedWidth: fixedWidth | $stbSettings?.columnFixedWidth,
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
        $stbSettings?.columnSizing == "flexible" && sizing == "flexible"
          ? flexFactor + " 1 auto"
          : "0 1 auto",
      width:
        columnOptions.sizing == "fixed" ? columnOptions.fixedWidth : "auto",
      "min-width": columnOptions.minWidth,
      "max-width": columnOptions.maxWidth,
    },
  };

  $: if (
    inBuilder &&
    $component.selected &&
    localField &&
    localField != field
  ) {
    builderStore.actions.updateProp("field", localField);
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
    let validFields = Object.keys(schema ?? {});
    return field && validFields.includes(field);
  };
</script>

<div use:styleable={$component.styles}>
  {#if !stbSettings && inBuilder}
    <p class="error-message">
      <i
        class="ri-error-warning-line"
        style="color: var(--spectrum-global-color-yellow-700)"
      />
      Super Columns can only be placed inside a Super Table
    </p>
  {:else if !isValid(field) && inBuilder}
    <FieldSelect bind:value={localField} {schema} />
  {:else if isValid(field)}
    <SuperTableColumn
      columnOptions={{ ...$columnOptions, hasChildren: $component.children }}
    >
      <slot />
    </SuperTableColumn>
  {/if}
</div>

<style>
  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
  }
</style>
