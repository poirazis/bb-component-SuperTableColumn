<script>
	import Icon from "../../../node_modules/@budibase/bbui/src/Icon/Icon.svelte"
  import Popover from "../../../node_modules/@budibase/bbui/src/Popover/Popover.svelte"

  export let filteringOperators, filterOperator, active
  export let open = false

  let controlAnchor

</script>
  
  <div bind:this={controlAnchor} class="control" class:active> 
    <Icon size="XS" hoverable name="FilterEdit" 
      color={ active ? "var(--primaryColor)" : null } 
      on:click={ () => open = !open }
    />
  </div>
      
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <Popover on:close={() => open = false } anchor={controlAnchor} align={"left"} {open}>
    <ul class="spectrum-Menu" role="menu">
      {#each filteringOperators as option }
        <li class="spectrum-Menu-item" 
          class:selected={ option.value == filterOperator }
          role="menuitem" tabindex="0" 
          on:click|stopPropagation={() => { filterOperator = option.value; open = false; } }
        >
            <span class="spectrum-Menu-itemLabel">{option.label}</span>
        </li>
      {/each}
    </ul>
  </Popover>

<style>
  .control {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .selected {
    font-weight: 800;
    color: var(--primaryColor);
  }
  
</style>

