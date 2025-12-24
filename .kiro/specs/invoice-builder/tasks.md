# Implementation Plan

- [x] 1. Set up project structure and development environment

  - Initialize React 19 project with Vite
  - Configure Tailwind CSS v4
  - Set up TypeScript configuration
  - Install and configure testing frameworks (Vitest, React Testing Library, fast-check)
  - Create basic project folder structure
  - _Requirements: 5.1, 5.2_

- [x] 2. Implement core data models and validation

  - [x] 2.1 Create TypeScript interfaces for Client, Invoice, and LineItem models

    - Define data model interfaces with proper typing
    - Implement validation functions for each model
    - Create utility functions for ID generation and date handling
    - _Requirements: 1.2, 2.1_

  - [ ]\* 2.2 Write property test for client data validation

    - **Property 12: Input validation consistency**
    - **Validates: Requirements 1.2**

  - [x] 2.3 Create calculation utilities for invoice totals

    - Implement line item total calculation (quantity \* unitPrice)
    - Implement invoice subtotal calculation (sum of line item totals)
    - Implement tax and final total calculations
    - _Requirements: 1.3_

  - [ ]\* 2.4 Write property test for invoice calculations
    - **Property 1: Invoice calculation correctness**
    - **Validates: Requirements 1.3**

- [-] 3. Implement storage service layer

  - [x] 3.1 Create StorageService class with local storage operations

    - Implement CRUD operations for clients and invoices
    - Add search functionality for both clients and invoices
    - Implement invoice number generation
    - Add error handling for storage operations
    - _Requirements: 1.4, 1.5, 2.1, 2.2, 3.2, 5.5_

  - [ ]\* 3.2 Write property test for client data persistence

    - **Property 2: Client data round-trip persistence**
    - **Validates: Requirements 2.1, 5.3**

  - [ ]\* 3.3 Write property test for invoice data persistence

    - **Property 3: Invoice data round-trip persistence**
    - **Validates: Requirements 1.4, 1.5, 5.3**

  - [ ]\* 3.4 Write property test for invoice number uniqueness

    - **Property 4: Invoice number uniqueness**
    - **Validates: Requirements 1.4**

  - [ ]\* 3.5 Write property test for storage error handling
    - **Property 11: Storage error handling**
    - **Validates: Requirements 5.5**

- [x] 4. Create business logic managers

  - [x] 4.1 Implement InvoiceManager class

    - Create methods for invoice CRUD operations
    - Implement invoice calculation logic
    - Add invoice search and filtering
    - _Requirements: 1.3, 1.4, 3.2, 3.5_

  - [x] 4.2 Implement ClientManager class

    - Create methods for client CRUD operations
    - Implement client search functionality
    - Add client validation logic
    - _Requirements: 2.1, 2.2, 2.4_

  - [ ]\* 4.3 Write property test for client search functionality

    - **Property 5: Client search correctness**
    - **Validates: Requirements 2.2**

  - [ ]\* 4.4 Write property test for invoice search functionality

    - **Property 8: Invoice search and filter correctness**
    - **Validates: Requirements 3.2**

  - [ ]\* 4.5 Write property test for invoice deletion
    - **Property 9: Invoice deletion completeness**
    - **Validates: Requirements 3.5**

- [x] 5. Implement custom React hooks

  - [x] 5.1 Create useLocalStorage hook

    - Implement hook for syncing state with local storage
    - Add error handling for storage operations
    - _Requirements: 1.5, 5.3, 5.5_

  - [x] 5.2 Create useClients hook

    - Implement client state management
    - Add client CRUD operations
    - Integrate with ClientManager and StorageService
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 5.3 Create useInvoices hook

    - Implement invoice state management
    - Add invoice CRUD operations
    - Integrate with InvoiceManager and StorageService
    - _Requirements: 1.3, 1.4, 3.2, 3.5_

  - [ ]\* 5.4 Write property test for client selection auto-population

    - **Property 6: Client selection auto-population**
    - **Validates: Requirements 2.3**

  - [ ]\* 5.5 Write property test for client update propagation
    - **Property 7: Client update propagation**
    - **Validates: Requirements 2.4**

- [x] 6. Create basic UI components

  - [x] 6.1 Implement common UI components

    - Create Button, Input, Modal, and Toast components
    - Style with Tailwind CSS v4
    - Add proper accessibility attributes
    - _Requirements: 1.1, 5.5_

  - [x] 6.2 Create SearchBar component

    - Implement search input with debouncing
    - Add search functionality for both clients and invoices
    - _Requirements: 2.2, 3.2_

  - [x] 6.3 Create LineItemForm and LineItemList components

    - Implement line item input form
    - Create list display for line items
    - Add add/remove functionality
    - _Requirements: 1.1, 1.3_

- [x] 7. Implement client management features

  - [x] 7.1 Create ClientForm component

    - Implement client creation and editing form
    - Add form validation and error handling
    - Style with Tailwind CSS
    - _Requirements: 1.2, 2.1, 2.4_

  - [x] 7.2 Create ClientList component

    - Implement client listing with search
    - Add edit and delete functionality
    - Display client information clearly
    - _Requirements: 2.2, 2.4_

  - [x] 7.3 Create ClientSelector component

    - Implement client selection dropdown for invoices
    - Add search functionality within selector
    - _Requirements: 2.3_

- [x] 8. Implement invoice management features

  - [x] 8.1 Create InvoiceForm component

    - Implement invoice creation and editing form
    - Integrate client selection and line item management
    - Add automatic calculation display
    - _Requirements: 1.1, 1.3, 2.3_

  - [x] 8.2 Create InvoiceList component

    - Implement invoice listing with search and filtering
    - Display invoice summary information
    - Add edit, delete, and view functionality
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [x] 8.3 Create InvoiceCard component

    - Implement individual invoice display card
    - Show key invoice information
    - Add action buttons for edit/delete/view
    - _Requirements: 3.1_

- [x] 9. Implement invoice rendering and printing

  - [x] 9.1 Create InvoiceTemplate component

    - Implement professional invoice layout
    - Include business branding and all required information
    - Style for both screen and print display
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 9.2 Implement print functionality

    - Add print button and print view
    - Ensure proper formatting for printing
    - _Requirements: 4.3_

  - [ ]\* 9.3 Write property test for invoice rendering
    - **Property 10: Invoice rendering completeness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 10. Create page components and routing

  - [x] 10.1 Set up React Router v6 configuration

    - Configure routes for all pages
    - Set up navigation structure
    - _Requirements: 1.1, 3.1_

  - [x] 10.2 Create Dashboard page

    - Implement main dashboard with overview
    - Add navigation to other sections
    - _Requirements: 1.1_

  - [x] 10.3 Create InvoiceListPage and InvoiceFormPage

    - Implement invoice management pages
    - Integrate with invoice components
    - _Requirements: 1.1, 3.1, 3.4_

  - [x] 10.4 Create ClientListPage and ClientFormPage

    - Implement client management pages
    - Integrate with client components
    - _Requirements: 2.1, 2.4_

  - [x] 10.5 Create InvoicePreviewPage

    - Implement invoice preview and print page
    - Integrate with InvoiceTemplate component
    - _Requirements: 3.3, 4.1_

- [x] 11. Implement layout and navigation

  - [x] 11.1 Create Layout component with Header and Navigation

    - Implement main application layout
    - Add responsive navigation menu
    - Style with Tailwind CSS v4
    - _Requirements: 1.1_

  - [x] 11.2 Create App component and integrate routing

    - Set up main App component
    - Integrate all pages and routing
    - Add global state management if needed
    - _Requirements: 1.1, 5.1_

- [x] 12. Add error handling and user feedback

  - [x] 12.1 Implement error boundary components

    - Create error boundaries for graceful error handling
    - Add error display components
    - _Requirements: 5.5_

  - [x] 12.2 Add toast notifications for user feedback

    - Implement success and error notifications
    - Integrate with all CRUD operations
    - _Requirements: 5.5_

- [ ] 13. Final integration and testing

  - [x] 13.1 Integrate all components and test complete workflows

    - Test end-to-end user workflows
    - Verify all features work together
    - Fix any integration issues
    - _Requirements: All_

  - [ ]\* 13.2 Write integration tests for complete user workflows
    - Test create client → create invoice → save → retrieve workflow
    - Test search and filtering across the application
    - Test print functionality end-to-end
    - _Requirements: All_

- [x] 14. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Polish and optimization

  - [x] 15.1 Optimize performance and accessibility

    - Review and optimize component re-renders
    - Ensure proper accessibility attributes
    - Test keyboard navigation
    - _Requirements: 5.1, 5.2_

  - [x] 15.2 Final styling and responsive design

    - Ensure consistent styling across all components
    - Test responsive design on different screen sizes
    - Polish user interface details
    - _Requirements: 1.1_
