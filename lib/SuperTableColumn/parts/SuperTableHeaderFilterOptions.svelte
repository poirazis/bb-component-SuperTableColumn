<script>
  import { createEventDispatcher } from "svelte";

	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
  import ActionMenu from "../../../node_modules/@budibase/bbui/src/ActionMenu/ActionMenu.svelte"
  import Item from "../../../node_modules/@budibase/bbui/src/Menu/Item.svelte"

  export let filteringOperators, filteringOperator, active
</script>

  <ActionMenu>
    <div slot="control" class="control icon">
      <Icon size="XS" hoverable name="FilterEdit" color={ active ? "var(--primaryColor)" : null } />
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

<style>
  .control {
    width: 32px;
    height: 100%;
    display: flex;
    justify-content: center;
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }
  
  .selected {
    font-weight: 800;
    color: var(--primaryColor);
  }
</style>

