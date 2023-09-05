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

  <Popover on:close={() => open = false } anchor={controlAnchor} align={"left"} {open}>
    <div class="options"> 
      {#each filteringOperators as option }
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div 
          class="option text" 
          class:selected={ option.value == filterOperator }
          on:click|stopPropagation={() => { filterOperator = option.value; open = false; } }
        >
          {option.label}
        </div>
      {/each}
    </div>
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

  .options {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow-y: auto;
  }
  .option {
    padding: 0 0.85rem;
    display: flex;
    gap: 0.3rem;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    height: 2rem;
  }
  .option:hover,
  .option.focused {
    background-color: var(--spectrum-global-color-gray-200);
    border-radius: 4px;
  }
</style>

