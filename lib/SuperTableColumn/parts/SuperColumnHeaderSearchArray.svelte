<script>
  import { createEventDispatcher } from "svelte";
  import Multiselect from "../../../node_modules/@budibase/bbui/src/Form/Core/Multiselect.svelte";

  const dispatch = createEventDispatcher()
  
  export let value
  export let valueOptions
  
</script>


<div class="searchControl">
    <Multiselect {value} options={valueOptions} 
      on:change={ (e) => { 
        value = e.detail;
        dispatch("filter", { value: e.detail } ) } }
    />
</div>

<style>
  .searchControl {
    min-width: 100px;
    flex: auto;
    display: flex;
    align-items: center;
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }

  :global(.searchControl button) {
    border: none;
  }
</style>