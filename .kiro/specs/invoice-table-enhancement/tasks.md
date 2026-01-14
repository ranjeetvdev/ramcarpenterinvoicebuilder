# Implementation Plan: Invoice Table Enhancement

## Overview

This implementation plan converts the invoice table enhancement design into discrete coding tasks. The enhancement adds unit specification and optional total quantity fields to line items while reordering table columns for better usability. All changes maintain backward compatibility with existing invoices.

## Tasks

- [x] 1. Update data models and validation

  - [x] 1.1 Enhance LineItem interface with new optional fields

    - Add `unit?: string` field for unit of measurement
    - Add `totalQuantity?: number` field for additional quantity tracking
    - Update TypeScript interface in src/types/index.ts
    - _Requirements: 2.1, 2.2, 3.1, 3.2_

  - [ ]\* 1.2 Write property test for unit field persistence

    - **Property 3: Unit field persistence**
    - **Validates: Requirements 2.2**

  - [x] 1.3 Enhance LineItem validation function

    - Add validation for optional unit field (string, max 20 characters)
    - Add validation for optional totalQuantity field (positive number)
    - Maintain backward compatibility with existing validation
    - _Requirements: 2.5, 3.2_

  - [ ]\* 1.4 Write property test for unit validation acceptance

    - **Property 6: Unit validation acceptance**
    - **Validates: Requirements 2.5**

  - [ ]\* 1.5 Write property test for total quantity persistence
    - **Property 7: Total quantity persistence**
    - **Validates: Requirements 3.2**

- [x] 2. Update LineItemForm component

  - [x] 2.1 Add new input fields to form

    - Add unit input field after unit price field
    - Add optional total quantity input field
    - Update form state to include new fields
    - _Requirements: 1.2, 2.1, 3.1_

  - [x] 2.2 Update form validation and submission

    - Include new fields in form validation
    - Pass new fields to onAdd callback
    - Handle empty values gracefully
    - _Requirements: 2.2, 3.2_

  - [ ]\* 2.3 Write property test for form field order consistency
    - **Property 2: Form field order consistency**
    - **Validates: Requirements 1.2**

- [x] 3. Update LineItemList component

  - [x] 3.1 Reorder table columns

    - Change column order to: Sr. No., Description, Quantity, Unit Price, Per, Amount
    - Update table headers with new structure
    - Adjust column widths for optimal display
    - _Requirements: 1.1, 1.3_

  - [x] 3.2 Implement enhanced quantity display

    - Show main quantity in quantity column
    - Display total quantity below main quantity when present
    - Style total quantity with visual distinction
    - _Requirements: 3.3, 3.4, 5.3_

  - [x] 3.3 Add Per column display

    - Show unit value in dedicated Per column
    - Handle empty unit values gracefully
    - Ensure proper column alignment
    - _Requirements: 2.3, 2.4_

  - [ ]\* 3.4 Write property test for table column order consistency

    - **Property 1: Table column order consistency**
    - **Validates: Requirements 1.1, 1.3**

  - [ ]\* 3.5 Write property test for unit display in Per column

    - **Property 4: Unit display in Per column**
    - **Validates: Requirements 2.3**

  - [ ]\* 3.6 Write property test for empty unit graceful handling

    - **Property 5: Empty unit graceful handling**
    - **Validates: Requirements 2.4**

  - [ ]\* 3.7 Write property test for total quantity display positioning

    - **Property 8: Total quantity display positioning**
    - **Validates: Requirements 3.3**

  - [ ]\* 3.8 Write property test for empty total quantity graceful handling
    - **Property 9: Empty total quantity graceful handling**
    - **Validates: Requirements 3.4**

- [x] 4. Update InvoiceTemplate component for printing

  - [x] 4.1 Reorder print template columns

    - Update print table structure with new column order
    - Adjust column widths for print layout
    - Ensure proper alignment and spacing
    - _Requirements: 1.3, 4.5, 5.1_

  - [x] 4.2 Implement enhanced fields in print template

    - Add Per column to print template
    - Display total quantity below main quantity in print view
    - Maintain professional appearance
    - _Requirements: 4.5, 5.3_

  - [ ]\* 4.3 Write property test for export format inclusion
    - **Property 15: Export format inclusion**
    - **Validates: Requirements 4.5**

- [x] 5. Ensure calculation consistency

  - [x] 5.1 Verify calculation logic uses main quantity only

    - Confirm existing calculation functions ignore totalQuantity
    - Test that invoice totals remain accurate
    - Ensure backward compatibility with existing invoices
    - _Requirements: 3.5, 4.3_

  - [ ]\* 5.2 Write property test for calculation uses main quantity only

    - **Property 10: Calculation uses main quantity only**
    - **Validates: Requirements 3.5**

  - [ ]\* 5.3 Write property test for calculation consistency
    - **Property 13: Calculation consistency**
    - **Validates: Requirements 4.3**

- [-] 6. Implement backward compatibility

  - [x] 6.1 Test existing invoice display

    - Verify old invoices display correctly with new table structure
    - Ensure empty values for new fields don't cause errors
    - Test mixed old/new format invoice lists
    - _Requirements: 4.2, 4.4_

  - [ ] 6.2 Write property test for enhanced field persistence

    - **Property 11: Enhanced field persistence**
    - **Validates: Requirements 4.1**

  - [ ]\* 6.3 Write property test for backward compatibility display

    - **Property 12: Backward compatibility display**
    - **Validates: Requirements 4.2**

  - [ ]\* 6.4 Write property test for search compatibility
    - **Property 14: Search compatibility**
    - **Validates: Requirements 4.4**

- [x] 7. Add visual styling enhancements

  - [x] 7.1 Style total quantity display

    - Add CSS classes for visual distinction of total quantity
    - Ensure proper spacing and alignment
    - Maintain responsive design
    - _Requirements: 5.3_

  - [x] 7.2 Optimize table responsive design

    - Ensure new columns work on mobile devices
    - Adjust column priorities for smaller screens
    - Test table usability across screen sizes
    - _Requirements: 5.5_

  - [ ]\* 7.3 Write property test for visual distinction for total quantity
    - **Property 16: Visual distinction for total quantity**
    - **Validates: Requirements 5.3**

- [x] 8. Integration testing and validation

  - [x] 8.1 Test complete workflow with enhanced line items

    - Create line items with unit and total quantity
    - Save invoice and verify persistence
    - Display invoice in list and detail views
    - Print invoice and verify formatting
    - _Requirements: All_

  - [x] 8.2 Test backward compatibility workflow

    - Load existing invoices without enhanced fields
    - Display in new table structure
    - Verify no errors or display issues
    - _Requirements: 4.2, 4.4_

  - [ ]\* 8.3 Write integration tests for complete workflows
    - Test create enhanced line item → save → display → print workflow
    - Test backward compatibility with existing invoices
    - Test form interactions with new fields

- [x] 9. Checkpoint - Ensure all tests pass
  - [x] Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All changes maintain backward compatibility with existing invoices
- New fields are optional and gracefully handle empty values
