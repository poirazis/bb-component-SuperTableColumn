<script>
  import CellOption from "../../bb_super_components_shared/src/lib/SuperCell/cells/CellOptions.svelte";

  export let schema
  export let value

  $: cellOptions = {
    optionsSource: "custom",
    customOptions: Object.keys(schema),
    controlType : "select",
    optionsViewMode: "text",
    autocomplete: true,
    placeholder: "Select Field",
    role: "formInput", 
    clearValueIcon:true
  }
</script>

<p> Column: </p>

<CellOption
  on:change={ (e) => value = e.detail[0]}
  {cellOptions}
  />
