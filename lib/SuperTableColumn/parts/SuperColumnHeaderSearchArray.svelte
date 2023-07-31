<script>
  import { createEventDispatcher } from "svelte";
  
  import ActionMenu from "../../../node_modules/@budibase/bbui/src/ActionMenu/ActionMenu.svelte"
  import Item from "../../../node_modules/@budibase/bbui/src/Menu/Item.svelte"
  import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
  import Multiselect from "../../../node_modules/@budibase/bbui/src/Form/Core/Multiselect.svelte";

  const dispatch = createEventDispatcher()
  
  export let value
  export let valueOptions
  export let defaultOperator
  export let filteringOperator
  export let filteringOperators
  
  let timer
  
  filteringOperator = defaultOperator

	const debounce = v => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			value = v;
		}, 500);
	}

</script>


<div class="searchControl">

  <div class="actionIcon">
    <ActionMenu>
      <div slot="control" class="control icon">
        <Icon size="XS" hoverable name="FilterEdit" color={ value ? "lime" : null } />
      </div>
      {#each filteringOperators as option}
        <Item on:click={ () => ( filteringOperator = option.value ) }>
          {#if option.value === filteringOperator }
            <span class="selected"> {option.label} </span>
          {:else}
            {option.label}
          {/if}
        </Item>
      {/each}
    </ActionMenu>
  </div>

  <div class="inputControl">
    <Multiselect {value} options={valueOptions} 
      on:change={ (e) => { 
        value = e.detail;
        dispatch("filter", { value: e.detail, operator: filteringOperator } ) } }
    />
  </div>

  <div class="actionIcon">
    <Icon on:click={ () => dispatch("closeMe") } size="XS" hoverable name="Close"/>
  </div>
</div>

<style>
  .searchControl {
    min-width: 100px;
    flex: auto;
    display: flex;
    align-items: stretch;
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));

  }
  .actionIcon {
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .inputControl {
    flex: auto;
    padding-left: 32px;
    padding-right: 32px;
    margin-left: -32px;
    margin-right: -32px;
  }
  .control {
    flex: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .selected {
    font-weight: 800;
    color: var(--primaryColor);
  }
  :global(.inputControl > button ) {
    border: none !important;
    height: 100%;
  }
</style>