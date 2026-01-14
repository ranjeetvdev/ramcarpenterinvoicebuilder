# Invoice Table Enhancement Design Document

## Overview

This design document outlines the enhancement of the existing Invoice Builder's line item table structure to improve usability and professional appearance. The enhancement reorders table columns, adds a unit specification field, and provides optional total quantity tracking while maintaining full backward compatibility with existing invoices.

The changes will be implemented as extensions to the existing TypeScript data models and React components, ensuring seamless integration with the current invoice management system.

## Architecture

The enhancement follows the existing Invoice Builder architecture pattern with minimal changes to the core structure:

```
┌─────────────────────────────────────┐
│     React Component Layer           │
│  (Enhanced Table Components)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Custom Hooks Layer              │
│  (useInvoices - unchanged)          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Business Logic Layer            │
│  (Enhanced LineItem validation)     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Data Access Layer               │
│    (Storage Service - unchanged)    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Browser Local Storage           │
│    (Enhanced LineItem schema)       │
└─────────────────────────────────────┘
```

**Key Architectural Principles:**

- **Backward Compatibility**: Existing invoices continue to work without modification
- **Progressive Enhancement**: New fields are optional and gracefully degrade
- **Minimal Impact**: Changes are localized to data models and display components
- **Consistent Validation**: Enhanced validation maintains existing patterns

## Components and Interfaces

### 1. Enhanced Data Models

**Enhanced LineItem Model**

```typescript
interface LineItem {
	id: string;
	description: string;
	quantity: number;
	unitPrice: number;
	total: number;
	// New fields (optional for backward compatibility)
	unit?: string; // Unit of measurement (e.g., "sq ft", "ft", "NO", "piece")
	totalQuantity?: number; // Optional total quantity for additional tracking
}
```

**Migration Strategy for Existing Data:**

- Existing LineItem objects without `unit` or `totalQuantity` fields will display correctly
- New fields default to `undefined` and are handled gracefully in all components
- No data migration required - enhancement is additive only

### 2. Enhanced Validation Functions

**Updated LineItem Validation**

```typescript
function validateLineItem(lineItem: Partial<LineItem>): ValidationResult {
	const errors: string[] = [];

	// Existing validations (unchanged)
	if (!lineItem.description?.trim()) {
		errors.push("Description is required");
	}
	if (typeof lineItem.quantity !== "number" || lineItem.quantity <= 0) {
		errors.push("Quantity must be a positive number greater than 0");
	}
	if (typeof lineItem.unitPrice !== "number" || lineItem.unitPrice < 0) {
		errors.push("Unit price must be a non-negative number");
	}

	// New validations for enhanced fields
	if (lineItem.unit !== undefined) {
		if (typeof lineItem.unit !== "string") {
			errors.push("Unit must be a string");
		} else if (lineItem.unit.length > 20) {
			errors.push("Unit must be 20 characters or less");
		}
	}

	if (lineItem.totalQuantity !== undefined) {
		if (
			typeof lineItem.totalQuantity !== "number" ||
			lineItem.totalQuantity <= 0
		) {
			errors.push("Total quantity must be a positive number greater than 0");
		}
	}

	return { isValid: errors.length === 0, errors };
}
```

### 3. Enhanced React Components

**Enhanced LineItemForm Component**

```typescript
interface LineItemFormProps {
	onAdd: (lineItem: Omit<LineItem, "id">) => void;
	onCancel?: () => void;
	initialData?: Partial<LineItem>;
	submitLabel?: string;
	className?: string;
}

// Form state includes new fields
const [formData, setFormData] = useState({
	description: initialData?.description || "",
	quantity: initialData?.quantity || 1,
	unitPrice: initialData?.unitPrice || 0,
	unit: initialData?.unit || "",
	totalQuantity: initialData?.totalQuantity || undefined,
});
```

**Enhanced LineItemList Component**

```typescript
// Updated table structure with reordered columns
<thead className="bg-gray-50">
  <tr>
    <th>Sr. No.</th>
    <th>Description</th>
    <th>Quantity</th>        {/* Moved before Unit Price */}
    <th>Unit Price</th>
    <th>Per</th>             {/* New column */}
    <th>Amount</th>
    {showActions && <th>Actions</th>}
  </tr>
</thead>

// Enhanced table body with new column order and fields
<tbody>
  {lineItems.map((item, index) => (
    <tr key={item.id}>
      <td>{index + 1}</td>
      <td>{item.description}</td>
      <td>
        {item.quantity}
        {item.totalQuantity && (
          <div className="text-xs text-gray-500 mt-1">
            Total: {item.totalQuantity}
          </div>
        )}
      </td>
      <td>₹{item.unitPrice.toFixed(2)}</td>
      <td>{item.unit || ""}</td>
      <td>₹{item.total.toFixed(2)}</td>
      {showActions && <td>{/* Action buttons */}</td>}
    </tr>
  ))}
</tbody>
```

**Enhanced InvoiceTemplate Component**

```typescript
// Updated print template with new column structure
<table className="w-full border-collapse">
	<thead>
		<tr className="bg-gray-800 text-white">
			<th className="text-center py-2 px-3 font-semibold text-sm w-12">#</th>
			<th className="text-left py-2 px-3 font-semibold text-sm">Particulars</th>
			<th className="text-right py-2 px-3 font-semibold text-sm w-20">Qty.</th>
			<th className="text-right py-2 px-3 font-semibold text-sm w-28">
				Unit Price
			</th>
			<th className="text-center py-2 px-3 font-semibold text-sm w-16">Per</th>
			<th className="text-right py-2 px-3 font-semibold text-sm w-28">
				Amount Rs.
			</th>
		</tr>
	</thead>
	<tbody>
		{invoice.lineItems.map((item, index) => (
			<tr key={item.id}>
				<td className="py-2 px-3 text-center">{index + 1}.</td>
				<td className="py-2 px-3">{item.description}</td>
				<td className="py-2 px-3 text-right">
					{item.quantity}
					{item.totalQuantity && (
						<div className="text-xs text-gray-600">({item.totalQuantity})</div>
					)}
				</td>
				<td className="py-2 px-3 text-right">
					{formatCurrency(item.unitPrice)}
				</td>
				<td className="py-2 px-3 text-center">{item.unit || ""}</td>
				<td className="py-2 px-3 text-right font-medium">
					{formatCurrency(item.total)}
				</td>
			</tr>
		))}
	</tbody>
</table>
```

## Data Models

### Enhanced LineItem Schema

**Field Specifications:**

- `id`: string (unchanged) - Unique identifier
- `description`: string (unchanged) - Service/product description
- `quantity`: number (unchanged) - Primary quantity for calculations
- `unitPrice`: number (unchanged) - Price per unit
- `total`: number (unchanged) - Calculated: quantity × unitPrice
- `unit`: string (optional, new) - Unit of measurement, max 20 characters
- `totalQuantity`: number (optional, new) - Additional quantity tracking

**Validation Rules:**

- `unit`: Optional string, max 20 characters, accepts any text including "sq ft", "ft", "NO", "piece", "hour"
- `totalQuantity`: Optional positive number, used for display only (not in calculations)
- All existing validation rules remain unchanged

**Backward Compatibility:**

- Existing LineItem objects without new fields display correctly
- New fields are optional and default to undefined
- Storage service handles mixed old/new format seamlessly
- No data migration required

### Data Relationships

- Invoice → LineItems: One-to-many (unchanged)
- LineItem calculations: Use only `quantity` and `unitPrice` (unchanged)
- New fields are display-only and don't affect business logic

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Table column order consistency

_For any_ line item table view (list, form, print), the columns should appear in the exact order: Serial Number, Description, Quantity, Unit Price, Per (unit), Amount.
**Validates: Requirements 1.1, 1.3**

### Property 2: Form field order consistency

_For any_ line item form (create or edit), the input fields should appear in the logical order: Description, Quantity, Unit Price, Per (unit).
**Validates: Requirements 1.2**

### Property 3: Unit field persistence

_For any_ line item with a unit value, saving and then retrieving the line item should return the same unit value unchanged.
**Validates: Requirements 2.2**

### Property 4: Unit display in Per column

_For any_ line item with a unit value, displaying the line item should show the unit in the dedicated "Per" column.
**Validates: Requirements 2.3**

### Property 5: Empty unit graceful handling

_For any_ line item without a unit value, displaying the line item should show an empty Per column without displaying placeholder text.
**Validates: Requirements 2.4**

### Property 6: Unit validation acceptance

_For any_ text string representing common units (including "sq ft", "ft", "NO", "piece", "hour"), the validation function should accept it as a valid unit.
**Validates: Requirements 2.5**

### Property 7: Total quantity persistence

_For any_ line item with a total quantity value, saving and then retrieving the line item should return the same total quantity value unchanged.
**Validates: Requirements 3.2**

### Property 8: Total quantity display positioning

_For any_ line item with a total quantity, displaying the line item should show the total quantity below the main quantity in the same table cell.
**Validates: Requirements 3.3**

### Property 9: Empty total quantity graceful handling

_For any_ line item without a total quantity, displaying the line item should show only the main quantity without additional display elements.
**Validates: Requirements 3.4**

### Property 10: Calculation uses main quantity only

_For any_ line item with both main quantity and total quantity, the calculated total should equal main quantity multiplied by unit price, ignoring the total quantity field.
**Validates: Requirements 3.5**

### Property 11: Enhanced field persistence

_For any_ invoice containing line items with unit and total quantity fields, saving and retrieving the invoice should preserve all enhanced field values.
**Validates: Requirements 4.1**

### Property 12: Backward compatibility display

_For any_ existing line item created before enhancement (without unit or total quantity fields), displaying the line item should work correctly with empty values for new fields.
**Validates: Requirements 4.2**

### Property 13: Calculation consistency

_For any_ invoice with enhanced line items, the invoice total calculation should equal the sum of (quantity × unit price) for each line item, maintaining existing calculation logic.
**Validates: Requirements 4.3**

### Property 14: Search compatibility

_For any_ search query on invoices containing both old and new format line items, the search should return results from both formats without errors.
**Validates: Requirements 4.4**

### Property 15: Export format inclusion

_For any_ invoice with enhanced line items, the printed or exported output should include the unit and total quantity fields in the formatted display.
**Validates: Requirements 4.5**

### Property 16: Visual distinction for total quantity

_For any_ line item with a total quantity, the total quantity display should have different CSS styling than the main quantity to provide visual distinction.
**Validates: Requirements 5.3**

<function_calls>
<invoke name="prework">
<parameter name="featureName">invoice-table-enhancement

## Error Handling

### Enhanced Validation Errors

- **Invalid Unit Format**: Accept any string up to 20 characters for maximum flexibility
- **Invalid Total Quantity**: Validate as positive number when provided, ignore when empty
- **Field Length Limits**: Prevent excessively long unit strings that could break layout
- **Type Validation**: Ensure unit is string and totalQuantity is number when provided

### Backward Compatibility Errors

- **Missing Field Handling**: Gracefully handle LineItem objects without new fields
- **Data Migration**: No migration errors since enhancement is additive only
- **Storage Compatibility**: Handle mixed old/new format data in local storage
- **Display Fallbacks**: Show empty values for missing fields without errors

### UI Error Handling

- **Form Validation**: Provide clear error messages for invalid unit or total quantity inputs
- **Display Errors**: Handle undefined/null values gracefully in table displays
- **Print Layout**: Ensure new columns don't break print formatting
- **Responsive Design**: Maintain table usability on smaller screens with new columns

## Testing Strategy

### Unit Testing Approach

The application will continue using **Vitest** as the testing framework for both unit tests and property-based tests.

**Unit Test Coverage for Enhanced Features:**

- **Enhanced Data Models**: Test validation functions for new LineItem fields (unit, totalQuantity)
- **Form Components**: Test LineItemForm with new input fields and validation
- **Display Components**: Test LineItemList and InvoiceTemplate with new column structure
- **Backward Compatibility**: Test handling of old LineItem format without new fields
- **Edge Cases**: Test empty values, boundary conditions, and invalid inputs for new fields

**Key Unit Test Examples:**

- LineItem with unit field validates correctly
- LineItem without unit field displays empty Per column
- Total quantity displays below main quantity when present
- Calculations ignore total quantity field
- Old format LineItems display correctly in new table structure

### Property-Based Testing Approach

**Property-Based Testing Library**: **fast-check** (JavaScript/TypeScript property-based testing library)

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Test Annotation Format**: Each property-based test must include a comment tag in this exact format:

```javascript
// **Feature: invoice-table-enhancement, Property {number}: {property_text}**
```

**Property Test Coverage:**

- **Property 1**: Table column order consistency - generate random line items, verify column order
- **Property 2**: Form field order consistency - verify form field DOM order
- **Property 3**: Unit field persistence - generate random units, save/retrieve, verify unchanged
- **Property 4**: Unit display in Per column - generate line items with units, verify display
- **Property 5**: Empty unit graceful handling - generate line items without units, verify empty display
- **Property 6**: Unit validation acceptance - generate various unit strings, verify validation
- **Property 7**: Total quantity persistence - generate random total quantities, save/retrieve
- **Property 8**: Total quantity display positioning - verify total quantity appears below main quantity
- **Property 9**: Empty total quantity graceful handling - verify only main quantity displays
- **Property 10**: Calculation uses main quantity only - verify calculations ignore total quantity
- **Property 11**: Enhanced field persistence - generate enhanced line items, verify all fields persist
- **Property 12**: Backward compatibility display - generate old format line items, verify display
- **Property 13**: Calculation consistency - verify invoice totals use existing calculation logic
- **Property 14**: Search compatibility - test search on mixed old/new format invoices
- **Property 15**: Export format inclusion - verify enhanced fields appear in printed output
- **Property 16**: Visual distinction for total quantity - verify different CSS styling

**Generator Strategy:**

- Create enhanced LineItem generators with optional unit and totalQuantity fields
- Generate realistic unit values: "sq ft", "ft", "NO", "piece", "hour", "kg", "m", etc.
- Generate edge cases: empty strings, very long strings, special characters
- Generate mixed old/new format invoice collections for compatibility testing
- Use shrinking to find minimal failing examples when tests fail

### Integration Testing

- Test complete workflows: create enhanced line item → save invoice → display → print
- Test backward compatibility: load old invoices → display with new table structure
- Test form interactions: create line item with new fields → validate → save
- Test responsive design: verify table displays correctly on different screen sizes
- Test print functionality: verify enhanced fields appear correctly in printed output

### Testing Principles

- Tests validate real functionality with enhanced data models
- Property-based tests verify universal correctness across many input combinations
- Unit tests verify specific examples and edge cases for new features
- Backward compatibility tests ensure existing functionality remains intact
- Each correctness property is implemented by exactly one property-based test
- Tests are placed close to implementation to catch errors early

## Implementation Notes

### Technology Stack

- **React 19**: Enhanced components with new table structure and form fields
- **TypeScript**: Enhanced type definitions for LineItem with optional fields
- **Tailwind CSS v4**: Updated styling for new table columns and responsive design
- **Vitest**: Testing framework for enhanced functionality
- **fast-check**: Property-based testing for new correctness properties

### Migration Strategy

- **No Data Migration Required**: Enhancement is purely additive
- **Graceful Degradation**: Old invoices display correctly with empty new fields
- **Progressive Enhancement**: New features available immediately for new line items
- **Storage Compatibility**: Mixed old/new format data handled seamlessly

### Performance Considerations

- **Minimal Impact**: New fields add negligible storage and processing overhead
- **Table Rendering**: New columns don't significantly impact rendering performance
- **Responsive Design**: Table remains usable on mobile devices with proper column sizing
- **Print Performance**: Enhanced print template maintains fast rendering

### Accessibility Enhancements

- **Semantic HTML**: New table columns use proper th/td structure
- **ARIA Labels**: Form fields include appropriate labels for screen readers
- **Keyboard Navigation**: Enhanced form maintains proper tab order
- **Screen Reader Support**: New fields announced correctly by assistive technology
- **Color Contrast**: Visual distinction for total quantity maintains accessibility standards

### Future Enhancements

- **Unit Dropdown**: Pre-populated dropdown with common units for faster input
- **Unit Conversion**: Automatic conversion between related units (ft to sq ft)
- **Quantity Templates**: Save common quantity/unit combinations for reuse
- **Advanced Calculations**: Support for complex quantity calculations using total quantity
- **Custom Column Order**: Allow users to customize table column arrangement
- **Export Enhancements**: Include enhanced fields in CSV/JSON export formats
