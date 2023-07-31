<script>
  import { createEventDispatcher } from "svelte";
  
  import ActionMenu from "../../../node_modules/@budibase/bbui/src/ActionMenu/ActionMenu.svelte"
  import Item from "../../../node_modules/@budibase/bbui/src/Menu/Item.svelte"
  import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
  import Switch from "../../../node_modules/@budibase/bbui/src/Form/Core/Switch.svelte"

  const dispatch = createEventDispatcher()
  
  export let defaultOperator
  export let filteringOperators
  
  let timer, value
  
  let filteringOperator = defaultOperator
  
  /**
   * A Function that takes in a value and debounces the assignment
   * @param v 
   */

	const debounce = v => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			value = v;
		}, 500);
	}

  /**
   * Whenever the value or the operator changes, notify parent
  */
  $: dispatch("filter", { value: value , operator: filteringOperator } )  
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
            <span class="selected"> { option.label } </span>
          {:else}
            {option.label}
          {/if}
        </Item>
      {/each}
    </ActionMenu>
  </div>

  <div class="inputControl">
    <Switch {value} on:change={ (e) => debounce(e.detail) } />
  </div>

  <div class="actionIcon">
    <Icon on:click={ () => dispatch("closeMe") } size="XS" hoverable name="Close"/>
  </div>
</div>

<style>
  .searchControl {
    flex-grow: 1;
    min-width: 100px;
    display: flex;
    align-items: center;
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
</style>