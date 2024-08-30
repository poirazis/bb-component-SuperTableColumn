<script>
  import CellOptions from "../../bb_super_components_shared/src/lib/SuperTableCells/CellOptions.svelte";
  export let schema;
  export let value;

  $: cellOptions = {
    optionsSource: "custom",
    customOptions: Object.keys(schema),
    controlType: "select",
    optionsViewMode: "text",
    autocomplete: true,
    padding: "0.5rem",
    addNew: false,
    placeholder: "Select Field",
    role: "formInput",
    debounce: 100,
  };
</script>

<p>Column:</p>

<CellOptions on:change={(e) => (value = e.detail)} {cellOptions} />
