# SupertTableColumn

A customizable column component designed specifically for the SuperTable, providing fine-grained control over column behavior, appearance, and functionality within Budibase applications.

## Overview

The SuperTableColumn component allows you to customize individual columns in your SuperTable with advanced features including data transformation, conditional styling, custom templates, and specialized column types for different data presentation needs.

## Key Features

### Column Types

- **Schema Columns**: Auto-populated from datasource schema with automatic type detection
- **Options Columns**: Dropdown/multi-select from data sources or custom options
- **Custom Columns**: Free-form template-based columns with JavaScript expressions
- **Container Columns**: Hold nested components or complex layouts

### Data Transformation

- **Value Templates**: Transform displayed data with JavaScript expressions
- **Footer Templates**: Custom aggregation and summary calculations
- **Context Binding**: Access to current row, field value, and parent context

### Customization Options

- **Alignment**: Left, center, or right alignment for header and cell content
- **Conditional Styling**: Dynamic colors, backgrounds, and fonts based on row data
- **Sizing Control**: Fixed or flexible width with min/max constraints
- **Options Display**: Pill-style or text-based option presentation

### Behavior Controls

- **Edit Permissions**: Enable/disable inline editing per column
- **Filtering Levels**: Simple, advanced, or disabled filtering
- **Sorting**: Enable/disable column sorting
- **Resize**: Allow user-controlled column resizing

## Usage Instructions

### Basic Setup

1. Nest within a SuperTable component
2. Select your Column Type from the settings panel
3. Configure data source and transformation templates as needed

### Configuration Sections

#### Column Configuration

- **Header**: Display name for the column (defaults to field name)
- **Value Template**: JavaScript expression to transform cell values (`{{ value }}` format)
- **Footer Template**: Expression for summary calculations (`{{ values }}` format for aggregation)

#### Column Type: Schema

- Uses table schema to auto-detect column type and rendering
- Supports all standard Budibase data types (strings, numbers, dates, relationships, etc.)

#### Column Type: Options

- **Options Source**: Choose between data-driven or custom static options
- **Data Source**: Select Budibase datasource for dynamic options
- **Value/Label Columns**: Map datasource columns to option values and display labels
- **Custom Options**: Define static key-value pairs for fixed lists

#### Column Type: Custom

- **Value Template**: Complete control over cell content with expressions
- **Context Access**: Full access to `{{ row }}`, `{{ value }}`, `{{ index }}` variables

#### Column Type: Container

- Host nested Budibase components within the column
- Useful for buttons, multiple values, or complex layouts

### Styling and Appearance

#### Dynamic Cell Colors

```js
// Text Color Template
{
  {
    row.Status === "Active" ? "green" : "gray";
  }
}

// Background Template
{
  {
    row.Priority === "High"
      ? "var(--spectrum-global-color-red-100)"
      : "transparent";
  }
}

// Font Weight Template
{
  {
    row.Status === "Important" ? "bold" : "normal";
  }
}
```

#### Options Display

- **Pills Mode**: Color-coded circular indicators for option values
- **Text Mode**: Plain text display with optional color coding
- **Option Colors**: Enable/disable visual distinction between option values

### Sizing and Layout

#### Flexible Sizing

- **Flex Factor**: Determines space distribution among flexible columns
- **Min/Max Width**: Responsive bounds for column width
- **Grow/Shrink**: Control how columns resize with table width

#### Fixed Sizing

- **Fixed Width**: Exact pixel-based column width
- **No Resize**: Lock column width regardless of content

### Permissions and Behavior

#### Column-Level Controls

- **Edit**: Override table-level edit settings for this column
- **Filter**: Set filtering mode independent of table defaults
- **Sort**: Enable/disable sorting specifically for this column
- **Resize**: Allow users to manually adjust column width

#### Template Context Variables

The component provides rich context for templates:

- `row`: Complete row data object
- `value`: Current field value
- `index`: Zero-based row index
- `id`: Row identifier (string or number)

### Example Configurations

#### Custom Formula Column

```
Value Template: {{ (row.Hours * row.Rate).toFixed(2) }}
Header: Total Amount
```

#### Status Indicator Column

```
Column Type: Options
Options Mode: Pills
Value Template: {{ row.CompletionPercent >= 100 ? 'Complete' : row.CompletionPercent > 50 ? 'In Progress' : 'Planning' }}
```

#### Multi-Line Rich Column

```
Column Type: Custom
Value Template:
{{
  `<div style="display: flex; flex-direction: column;">
    <strong>${row.ProductName}</strong>
    <small>${row.Description}</small>
    <span>${row.UnitPrice}</span>
  </div>`
}}
```

## Integration with SuperTable

The SuperTableColumn works seamlessly with the SuperTable component, inheriting global settings while allowing column-specific overrides. Don't hesitate to add fancy behaviors or complex templates - it's designed to handle advanced use cases efficiently.

## Performance Notes

- Templates are efficiently compiled only when settings change
- Column-specific rendering optimizes performance for large datasets
- Reactive updates ensure smooth interaction with changing data

## Dependencies

Requires SuperTable component and Budibase SDK.

Find out more about developing [Custom Plugins](https://docs.budibase.com/docs/custom-plugin) and [Budibase](https://github.com/Budibase/budibase).
