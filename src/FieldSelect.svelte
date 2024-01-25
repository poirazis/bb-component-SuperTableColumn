<script>
  import CellOption from "../../bb_super_components_shared/src/lib/SuperCells/CellOptions.svelte";

  export let schema
  export let value

  $: cellOptions = {
    optionsSource: "custom",
    customOptions: Object.keys(schema),
    controlType : "select",
    optionsViewMode: "text",
    autocomplete: false,
    addNew: false,
    placeholder: "Select Field",
    role: "formInput"
  }
</script>

<p> Column: </p>

<CellOption
  on:change={ (e) => value = e.detail }
  {cellOptions}
  />
