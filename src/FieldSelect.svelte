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

<div class="wrapper">
  <p>Column:</p>

  <div class="field">
    <CellOptions on:change={(e) => (value = e.detail)} {cellOptions} />
  </div>
</div>

<style>
  .wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }
</style>
