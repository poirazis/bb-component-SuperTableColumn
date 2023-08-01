<script>
  import { createEventDispatcher } from "svelte";
  
  import DatePicker from "../../../node_modules/@budibase/bbui/src/Form/Core/DatePicker.svelte"

  const dispatch = createEventDispatcher()
  
  export let value
</script>

<div class="searchControl">
  <DatePicker {value} on:change={ ( e ) => dispatch("filter", { value: e.detail } ) }/>
</div>

<style>
  .searchControl {
    min-width: 100px;
    flex: auto;
    display: flex;
    align-items: center;
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }

</style>