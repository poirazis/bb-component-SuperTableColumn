<script>
  import { createEventDispatcher } from "svelte";
  import Switch from "../../../node_modules/@budibase/bbui/src/Form/Core/Switch.svelte";
  
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
    <Switch {value} on:change={ (e) => debounce(e.detail) } />
</div>

<style>
  .searchControl {
    flex-grow: 1;
    min-width: 100px;
    display: flex;
    align-items: center;
    background-color: var(--spectrum-textfield-m-background-color, var(--spectrum-global-color-gray-50));
  }
</style>