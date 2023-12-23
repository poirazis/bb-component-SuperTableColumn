<script>
  import SuperCell from "../../bb_super_components_shared/src/lib/SuperCell/SuperCell.svelte";

  export let schema
  export let value

  let cellState

  $: cellOptions = {
    optionsSource: "custom",
    customOptions: Object.keys(schema),
    role: "formInput", 
    clearValueIcon:true
  }
</script>

<SuperCell
  bind:cellState
  {cellOptions}
  {value}
  fieldSchema={{ type: "options" }}
  editable
  on:change={(e) => value = e.detail[0] }
  on:blur={cellState.lostFocus}
  />
