<script>
  import Popover from "../../../node_modules/@budibase/bbui/src/Popover/Popover.svelte";
  import { SuperCell } from "../../../../bb-component-SuperTableCell/lib/SuperTableCell/index.js";

  export let columnState;
  export let columnOptions;

  let headerAnchor;
  let showFilteringOptions = false;
  let cellState;
  let filterValue;
  let filterOperator = columnOptions.defaultFilteringOperator;

  $: cellOptions = {
    align: columnOptions.align,
    color: columnOptions.color,
    background: columnOptions.background ?? "transparent",
    fontWeight: columnOptions.fontWeight,
    padding: columnOptions.padding,
  };

  const handleValueChange = (e) => {
    filterValue = e.detail;
    if (
      filterValue != undefined &&
      filterValue != "" &&
      filterValue.length != []
    ) {
      columnState.filter(buildFilter(filterOperator, filterValue));
    } else {
      columnState.clear();
    }
  };

  const buildFilter = (operator, value) => {
    return {
      field: columnOptions.name,
      operator: operator,
      value: columnOptions.schema.type == "number" ? Number(value) : value,
      valueType: "Value",
    };
  };

  const handleKeyboard = (e) => {
    if (e.key == "Enter") {
      columnState.filter(filterOperator, filterValue);
    }
    if (e.key == "Escape") {
      columnState.cancel();
    }
  };
</script>

{#if columnOptions.showHeader}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div
    bind:this={headerAnchor}
    class="spectrum-Table-headCell"
    class:enterting={$columnState == "Entering"}
    class:filtered={$columnState == "Filtered"}
    tabindex="0"
    on:keydown={handleKeyboard}
  >
    {#if $columnState == "Idle" || $columnState == "Ascending" || $columnState == "Descending"}
      {#if columnOptions.canFilter && columnOptions.defaultFilteringOperator}
        <div class="actionIcon" on:click={columnState.filter}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-search"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      {/if}

      <div
        class="headerLabel"
        style:justify-content={columnOptions?.headerAlign}
      >
        <div
          class="innerText"
          class:sortable={columnOptions.canSort}
          on:click={columnState.sort}
        >
          {columnOptions.displayName}
        </div>
      </div>

      {#if columnOptions.isSorted}
        <div class="actionIcon sort">
          srt
        </div>
      {/if}
    {:else if $columnState == "Entering" || $columnState == "Filtered"}
      <div
        class="actionIcon"
        on:click={(e) => {
          e.preventDefault();
          e.stopPropagation();
          showFilteringOptions = !showFilteringOptions;
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-settings-2"
          ><path d="M20 7h-9" /><path d="M14 17H5" /><circle
            cx="17"
            cy="17"
            r="3"
          /><circle cx="7" cy="7" r="3" /></svg
        >
      </div>

      <SuperCell
        bind:cellState
        value={filterValue}
        fieldSchema={columnOptions.schema}
        placeholder={"Search"}
        editable
        {cellOptions}
        initialState="Editing"
        lockState
        unstyled
        on:change={handleValueChange}
        on:blur={() =>
          setTimeout(() => {
            if (!showFilteringOptions && !filterValue) columnState.cancel();
          }, 100)}
      />

      <div class="actionIcon">
        <Icon
          size="XS"
          hoverable
          name="Close"
          color={"var(--spectrum-global-color-red-500)"}
          on:click={() => {
            filterValue = undefined;
            columnState.cancel();
          }}
        />
      </div>
    {:else if $columnState == "Loading"}
      <p>...</p>
    {/if}

    <Popover
      anchor={headerAnchor}
      align="left"
      dismissible
      open={showFilteringOptions}
      on:close={() => {
        showFilteringOptions = false;
      }}
    >
      <ul class="spectrum-Menu" role="menu">
        {#each columnOptions.filteringOperators as option}
          <li
            class="spectrum-Menu-item"
            class:selected={option.value == filterOperator}
            role="menuitem"
            tabindex="0"
            on:click|stopPropagation={() => {
              filterOperator = option.value;
              showFilteringOptions = false;
              columnState.filter(buildFilter(filterOperator, filterValue));
            }}
          >
            <span class="spectrum-Menu-itemLabel">{option.label}</span>
          </li>
        {/each}
      </ul>
    </Popover>
  </div>
{/if}

<style>
  .spectrum-Table-headCell {
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    height: 2.5rem;
    gap: 0.5rem;
    padding: unset;
    padding-right: var(--super-table-cell-padding);
    padding-left: var(--super-table-cell-padding);
    border: 1px solid transparent;
    border-bottom: 1px solid var(--spectrum-alias-border-color-mid);
    background-color: var(--super-table-header-bg-color);
  }
  .enterting {
    gap: 0rem;
    background-color: var(
      --spectrum-textfield-m-background-color,
      var(--spectrum-global-color-gray-50)
    );
  }
  .filtered {
    gap: 0rem;
    color: var(--spectrum-global-color-gray-800);
    border: 1px solid var(--spectrum-global-color-gray-500);
    font-weight: 700;
    background-color: var(
      --spectrum-textfield-m-background-color,
      var(--spectrum-global-color-gray-100)
    );
  }

  .headerLabel {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .innerText {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: var(--super-table-header-color);
  }

  .sortable {
    cursor: pointer;
  }
  .sortable:hover {
    filter: brightness(120%);
  }
  .actionIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--spectrum-global-color-gray-400);
  }

  .actionIcon:hover {
    color: var(--spectrum-global-color-blue-500);
    cursor: pointer;
  }

  .actionIcon:hover > svg {
    stroke-width: 2;
  }
  .selected {
    color: var(--primaryColor);
    background-color: var(--spectrum-global-color-gray-75);
  }
</style>
