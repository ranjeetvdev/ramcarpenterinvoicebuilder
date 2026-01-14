# Requirements Document

## Introduction

This enhancement to the Invoice Builder system improves the line item table structure to better match professional invoice formats. The system will reorder table columns, add a unit specification field, and provide optional total quantity tracking to improve invoice clarity and usability.

## Glossary

- **Invoice_System**: The existing web-based invoice builder application
- **Line_Item**: Individual service or product entry within an invoice
- **Per_Unit**: The unit of measurement for a line item (e.g., "sq ft", "ft", "NO", "piece")
- **Total_Quantity**: An optional field to track the total quantity across multiple measurements
- **Invoice_Template**: The printable/displayable format of the invoice

## Requirements

### Requirement 1

**User Story:** As Ram Carpenter, I want the invoice table columns to be reordered with quantity first, so that I can quickly see quantities before prices when reviewing line items.

#### Acceptance Criteria

1. WHEN displaying line items in any table view, THE Invoice_System SHALL show columns in this order: Serial Number, Description, Quantity, Unit Price, Per (unit), Amount
2. WHEN creating or editing line items, THE Invoice_System SHALL present input fields in the logical order: Description, Quantity, Unit Price, Per (unit)
3. WHEN printing or displaying invoices, THE Invoice_System SHALL maintain the new column order consistently across all views

### Requirement 2

**User Story:** As Ram Carpenter, I want to specify the unit of measurement for each line item, so that my invoices clearly indicate what the quantity represents.

#### Acceptance Criteria

1. WHEN creating a new line item, THE Invoice_System SHALL provide an input field for the unit of measurement
2. WHEN the user enters a unit value, THE Invoice_System SHALL store it as part of the line item data
3. WHEN displaying line items, THE Invoice_System SHALL show the unit in a dedicated "Per" column
4. WHEN the unit field is empty, THE Invoice_System SHALL display the line item without showing an empty unit
5. WHEN validating line items, THE Invoice_System SHALL accept any text value for the unit field including common units like "sq ft", "ft", "NO", "piece", "hour"

### Requirement 3

**User Story:** As Ram Carpenter, I want to optionally track total item quantities below the main quantity, so that I can provide additional quantity details when needed.

#### Acceptance Criteria

1. WHEN creating or editing a line item, THE Invoice_System SHALL provide an optional "Total Quantity" input field
2. WHEN the user enters a total quantity, THE Invoice_System SHALL store it as part of the line item data
3. WHEN displaying line items with total quantities, THE Invoice_System SHALL show the total quantity below the main quantity in the same cell
4. WHEN the total quantity field is empty, THE Invoice_System SHALL display only the main quantity
5. WHEN calculating line item totals, THE Invoice_System SHALL use only the main quantity field, not the total quantity

### Requirement 4

**User Story:** As Ram Carpenter, I want the enhanced line item structure to work seamlessly with existing invoice functionality, so that all current features continue to work without disruption.

#### Acceptance Criteria

1. WHEN saving invoices with enhanced line items, THE Invoice_System SHALL persist all new fields (unit, total quantity) to local storage
2. WHEN loading existing invoices created before this enhancement, THE Invoice_System SHALL display them correctly with empty unit and total quantity fields
3. WHEN calculating invoice totals, THE Invoice_System SHALL continue using the existing calculation logic (quantity × unit price)
4. WHEN searching or filtering invoices, THE Invoice_System SHALL continue to work with both old and new invoice formats
5. WHEN exporting or printing invoices, THE Invoice_System SHALL include the new fields in the output format

### Requirement 5

**User Story:** As Ram Carpenter, I want the enhanced invoice template to maintain professional appearance, so that my printed invoices continue to look polished and clear.

#### Acceptance Criteria

1. WHEN printing invoices with the new column structure, THE Invoice_System SHALL maintain proper column alignment and spacing
2. WHEN the "Per" column contains units, THE Invoice_System SHALL display them clearly without affecting other column widths
3. WHEN total quantities are present, THE Invoice_System SHALL display them in a visually distinct way below the main quantity
4. WHEN printing invoices, THE Invoice_System SHALL ensure all new fields fit within standard page margins
5. WHEN displaying invoices on screen, THE Invoice_System SHALL maintain responsive design for different screen sizes
