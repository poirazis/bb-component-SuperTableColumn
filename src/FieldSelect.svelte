<script>
  import CellOptions from "../../bb_super_components_shared/src/lib/SuperTableCells/CellOptions.svelte";
  export let schema;
  export let value;

  $: cellOptions = {
    optionsSource: "custom",
    customOptions: Object.keys(schema),
    controlType: "select",
    optionsViewMode: "text",
    autocomplete: false,
    padding: "0.5rem",
    addNew: false,
    placeholder: "Select Field",
    role: "formInput",
  };
</script>

<p>Column:</p>

<CellOptions on:change={(e) => (value = e.detail)} {cellOptions} />
