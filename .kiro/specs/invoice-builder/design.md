# Invoice Builder Design Document

## Overview

The Invoice Builder is a client-side web application built with React.js that enables Ram Carpenter to create, manage, and generate professional invoices for carpentry services. The application operates entirely in the browser using local storage for data persistence, requiring no backend server or database infrastructure.

The system follows a component-based architecture with clear separation between data models, business logic, storage operations, and React UI components. This design ensures maintainability, testability, reusability, and ease of future enhancements.

## Architecture

The application follows a React-based component architecture with layered separation:

```
┌─────────────────────────────────────┐
│     React Component Layer           │
│  (Pages, Forms, Lists, UI Elements) │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Custom Hooks Layer              │
│  (useInvoices, useClients, etc.)    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Business Logic Layer            │
│  (Invoice Manager, Client Manager)  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Data Access Layer               │
│    (Storage Service)                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Browser Local Storage           │
└─────────────────────────────────────┘
```

**Key Architectural Principles:**

- Single Page Application (SPA) using React Router for navigation
- Component-based UI with reusable React components
- Custom hooks for state management and business logic
- Client-side data persistence using browser local storage
- Unidirectional data flow following React patterns
- Separation of concerns between presentation, logic, and data access

## Components and Interfaces

### 1. Data Models

**Client Model**

```javascript
{
  id: string,           // Unique identifier (UUID)
  name: string,         // Client full name
  address: string,      // Client address
  phone: string,        // Contact phone number
  email: string,        // Contact email
  createdAt: timestamp  // Creation timestamp
}
```

**LineItem Model**

```javascript
{
  id: string,           // Unique identifier
  description: string,  // Service/product description
  quantity: number,     // Quantity (must be > 0)
  unitPrice: number,    // Price per unit (must be >= 0)
  total: number         // Calculated: quantity * unitPrice
}
```

**Invoice Model**

```javascript
{
  id: string,           // Unique identifier (UUID)
  invoiceNumber: string,// Sequential invoice number (e.g., "INV-001")
  clientId: string,     // Reference to Client
  client: Client,       // Embedded client data
  lineItems: LineItem[],// Array of line items
  subtotal: number,     // Sum of all line item totals
  tax: number,          // Tax amount (if applicable)
  total: number,        // Final total amount
  issueDate: timestamp, // Invoice creation date
  dueDate: timestamp,   // Payment due date
  notes: string,        // Additional notes/terms
  status: string,       // 'draft' | 'issued' | 'paid'
  createdAt: timestamp, // Creation timestamp
  updatedAt: timestamp  // Last update timestamp
}
```

### 2. Storage Service

**Interface:**

```javascript
class StorageService {
  // Client operations
  saveClient(client: Client): void
  getClient(id: string): Client | null
  getAllClients(): Client[]
  updateClient(client: Client): void
  deleteClient(id: string): void
  searchClients(query: string): Client[]

  // Invoice operations
  saveInvoice(invoice: Invoice): void
  getInvoice(id: string): Invoice | null
  getAllInvoices(): Invoice[]
  updateInvoice(invoice: Invoice): void
  deleteInvoice(id: string): void
  searchInvoices(query: string): Invoice[]
  getNextInvoiceNumber(): string

  // Utility
  clearAll(): void
  exportData(): string
  importData(data: string): void
}
```

### 3. Invoice Manager

**Interface:**

```javascript
class InvoiceManager {
  createInvoice(clientId: string): Invoice
  addLineItem(invoice: Invoice, item: LineItem): Invoice
  removeLineItem(invoice: Invoice, itemId: string): Invoice
  updateLineItem(invoice: Invoice, item: LineItem): Invoice
  calculateTotals(invoice: Invoice): Invoice
  saveInvoice(invoice: Invoice): void
  deleteInvoice(invoiceId: string): void
  getInvoice(invoiceId: string): Invoice | null
  getAllInvoices(): Invoice[]
  searchInvoices(query: string): Invoice[]
}
```

### 4. Client Manager

**Interface:**

```javascript
class ClientManager {
  createClient(data: ClientData): Client
  updateClient(client: Client): void
  deleteClient(clientId: string): void
  getClient(clientId: string): Client | null
  getAllClients(): Client[]
  searchClients(query: string): Client[]
}
```

### 5. React Components

**Component Structure:**

```
App
├── Layout
│   ├── Header
│   └── Navigation
├── Pages
│   ├── Dashboard
│   ├── InvoiceListPage
│   ├── InvoiceFormPage
│   ├── InvoicePreviewPage
│   ├── ClientListPage
│   └── ClientFormPage
├── Components
│   ├── InvoiceForm
│   ├── InvoiceList
│   ├── InvoiceCard
│   ├── ClientForm
│   ├── ClientList
│   ├── ClientSelector
│   ├── LineItemForm
│   ├── LineItemList
│   └── SearchBar
└── Common
    ├── Button
    ├── Input
    ├── Modal
    └── Toast
```

**Custom Hooks:**

```javascript
// useInvoices - Manages invoice state and operations
function useInvoices() {
  const [invoices, setInvoices] = useState([])
  const createInvoice = (clientId) => { ... }
  const updateInvoice = (invoice) => { ... }
  const deleteInvoice = (id) => { ... }
  const searchInvoices = (query) => { ... }
  return { invoices, createInvoice, updateInvoice, deleteInvoice, searchInvoices }
}

// useClients - Manages client state and operations
function useClients() {
  const [clients, setClients] = useState([])
  const createClient = (data) => { ... }
  const updateClient = (client) => { ... }
  const deleteClient = (id) => { ... }
  const searchClients = (query) => { ... }
  return { clients, createClient, updateClient, deleteClient, searchClients }
}

// useLocalStorage - Syncs state with local storage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => { ... })
  useEffect(() => { ... }, [key, value])
  return [value, setValue]
}
```

### 6. Invoice Template Renderer

**React Component:**

```javascript
// InvoiceTemplate - Renders printable invoice
function InvoiceTemplate({ invoice }) {
  return (
    <div className="invoice-template">
      {/* Business branding, client info, line items, totals */}
    </div>
  )
}

// Utility functions
function printInvoice(invoice: Invoice): void
function generatePDF(invoice: Invoice): void  // Future enhancement
```

## Data Models

### Validation Rules

**Client Validation:**

- `name`: Required, non-empty string, max 200 characters
- `address`: Optional, max 500 characters
- `phone`: Optional, valid phone format (flexible)
- `email`: Optional, valid email format if provided

**LineItem Validation:**

- `description`: Required, non-empty string, max 500 characters
- `quantity`: Required, positive number > 0
- `unitPrice`: Required, non-negative number >= 0
- `total`: Calculated field, must equal quantity \* unitPrice

**Invoice Validation:**

- `clientId`: Required, must reference existing client
- `lineItems`: Must contain at least one valid line item
- `issueDate`: Required, valid date
- `dueDate`: Required, valid date, must be >= issueDate
- `status`: Must be one of: 'draft', 'issued', 'paid'

### Data Relationships

- Invoice → Client: Many-to-one (many invoices can reference one client)
- Invoice → LineItems: One-to-many (one invoice contains multiple line items)
- Client data is embedded in invoices for historical accuracy (if client details change, old invoices remain unchanged)

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Invoice calculation correctness

_For any_ invoice with line items, the subtotal should equal the sum of all line item totals, and each line item total should equal its quantity multiplied by its unit price.
**Validates: Requirements 1.3**

### Property 2: Client data round-trip persistence

_For any_ valid client object, saving it to storage and then retrieving it should return an equivalent client with all fields preserved (name, address, phone, email).
**Validates: Requirements 2.1, 5.3**

### Property 3: Invoice data round-trip persistence

_For any_ valid invoice object, saving it to storage and then retrieving it should return an equivalent invoice with all fields preserved including client data, line items, dates, and totals.
**Validates: Requirements 1.4, 1.5, 5.3**

### Property 4: Invoice number uniqueness

_For any_ sequence of invoice creation operations, each generated invoice number should be unique and never repeat.
**Validates: Requirements 1.4**

### Property 5: Client search correctness

_For any_ set of stored clients and search query, all returned results should match the query in either name, phone, or email fields, and all matching clients should be included in results.
**Validates: Requirements 2.2**

### Property 6: Client selection auto-population

_For any_ stored client, selecting that client for an invoice should populate the invoice with client data that matches the stored client data exactly.
**Validates: Requirements 2.3**

### Property 7: Client update propagation

_For any_ client, after updating its information, retrieving that client should return the updated data, not the original data.
**Validates: Requirements 2.4**

### Property 8: Invoice search and filter correctness

_For any_ set of stored invoices and search query, all returned results should match the query in client name, invoice number, or fall within the specified date range.
**Validates: Requirements 3.2**

### Property 9: Invoice deletion completeness

_For any_ invoice, after deleting it, attempting to retrieve that invoice should return null, and it should not appear in the list of all invoices.
**Validates: Requirements 3.5**

### Property 10: Invoice rendering completeness

_For any_ valid invoice, the rendered HTML output should contain all required elements: business branding, client information (name, address, contact), all line items with descriptions and amounts, subtotal, total, issue date, and due date.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 11: Storage error handling

_For any_ storage operation that fails (throws an error), the system should catch the error, not crash, and return an appropriate error indication to the caller.
**Validates: Requirements 5.5**

### Property 12: Input validation consistency

_For any_ client data with invalid fields (empty name, invalid email format), the validation function should reject it consistently and provide clear error messages.
**Validates: Requirements 1.2**

## Error Handling

### Storage Errors

- **Local Storage Full**: Detect quota exceeded errors and notify user to clear old data
- **Storage Unavailable**: Handle cases where local storage is disabled or unavailable
- **Data Corruption**: Validate data structure when reading from storage, handle malformed data gracefully
- **Concurrent Access**: Handle potential race conditions if multiple tabs are open

### Validation Errors

- **Invalid Client Data**: Provide specific error messages for each validation failure
- **Invalid Line Items**: Prevent negative quantities or prices, require descriptions
- **Invalid Dates**: Ensure due date is not before issue date
- **Empty Invoices**: Prevent saving invoices with no line items

### User Input Errors

- **Malformed Input**: Sanitize and validate all user inputs
- **Missing Required Fields**: Highlight required fields and prevent submission
- **Type Mismatches**: Convert and validate numeric inputs

### Error Display Strategy

- Use non-intrusive toast notifications for minor errors
- Use modal dialogs for critical errors requiring user action
- Provide clear, actionable error messages
- Log errors to console for debugging

## Testing Strategy

### Unit Testing Approach

The application will use **Vitest** as the testing framework for both unit tests and property-based tests. Vitest provides fast execution, excellent TypeScript support, and compatibility with modern JavaScript features.

**Unit Test Coverage:**

- **Data Models**: Test validation functions for Client, Invoice, and LineItem models
- **Storage Service**: Test CRUD operations with mocked local storage
- **Calculation Functions**: Test invoice total calculations with specific examples
- **Utility Functions**: Test date formatting, ID generation, and string manipulation
- **Edge Cases**: Test empty inputs, boundary values, and error conditions

**Key Unit Test Examples:**

- Empty invoice should have zero total
- Single line item invoice calculates correctly
- Invalid email format is rejected
- Duplicate invoice numbers are prevented
- Deleting non-existent invoice handles gracefully

### Property-Based Testing Approach

**Property-Based Testing Library**: **fast-check** (JavaScript/TypeScript property-based testing library)

**Configuration**: Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Test Annotation Format**: Each property-based test must include a comment tag in this exact format:

```javascript
// **Feature: invoice-builder, Property {number}: {property_text}**
```

**Property Test Coverage:**

- **Property 1**: Invoice calculation correctness - generate random line items and verify totals
- **Property 2**: Client data round-trip - generate random clients, save and retrieve
- **Property 3**: Invoice data round-trip - generate random invoices, save and retrieve
- **Property 4**: Invoice number uniqueness - generate multiple invoices, verify unique numbers
- **Property 5**: Client search correctness - generate random clients and queries, verify matches
- **Property 6**: Client selection auto-population - generate clients, verify population
- **Property 7**: Client update propagation - generate clients, update, verify changes
- **Property 8**: Invoice search correctness - generate invoices and queries, verify filtering
- **Property 9**: Invoice deletion completeness - generate invoices, delete, verify removal
- **Property 10**: Invoice rendering completeness - generate invoices, verify HTML contains all data
- **Property 11**: Storage error handling - simulate errors, verify graceful handling
- **Property 12**: Input validation consistency - generate invalid inputs, verify rejection

**Generator Strategy:**

- Create smart generators that produce valid domain objects (clients, invoices, line items)
- Generate edge cases: empty strings, very long strings, zero values, large numbers
- Generate realistic data: valid email formats, phone numbers, dates
- Use shrinking to find minimal failing examples when tests fail

### Integration Testing

- Test complete user workflows: create client → create invoice → save → retrieve
- Test data persistence across simulated page refreshes
- Test React component interactions using React Testing Library
- Test routing and navigation between pages
- Test print/export functionality end-to-end

### Testing Principles

- Tests should validate real functionality, not mocked behavior
- Property-based tests verify universal correctness across many inputs
- Unit tests verify specific examples and edge cases
- Both testing approaches are complementary and essential
- Each correctness property must be implemented by exactly one property-based test
- Tests should be placed close to implementation to catch errors early

## Implementation Notes

### Technology Stack

- **React 19**: Latest component-based UI library with enhanced concurrent features and compiler optimizations
- **React Router v6**: Client-side routing for SPA navigation
- **Tailwind CSS v4**: Next-generation utility-first CSS framework with improved performance and developer experience
- **TypeScript**: Type-safe JavaScript for better development experience
- **Vite**: Fast build tool and dev server with HMR
- **Local Storage API**: Browser-based data persistence
- **Vitest**: Testing framework
- **React Testing Library**: Component testing utilities
- **fast-check**: Property-based testing library

### Browser Compatibility

- Target modern browsers (Chrome, Firefox, Safari, Edge)
- Use standard Web APIs (no polyfills needed for modern browsers)
- Graceful degradation for older browsers

### Future Enhancements

- PDF export functionality
- Email invoice capability
- Multiple tax rates
- Payment tracking
- Invoice templates customization
- Data export/import (JSON, CSV)
- Cloud backup integration
- Multi-user support with authentication

### Performance Considerations

- Leverage React 19's automatic compiler optimizations for better performance
- Use React.memo for expensive component renders when needed
- Lazy load routes using React.lazy and Suspense
- Debounce search inputs with custom hooks
- Virtualize long lists if invoice/client count grows large
- Optimize re-renders with proper dependency arrays in hooks
- Cache frequently accessed data in context or custom hooks
- Leverage Tailwind CSS v4's improved build performance and smaller bundle sizes

### Security Considerations

- Sanitize all user inputs to prevent XSS
- Validate data types and ranges
- No sensitive data storage (local storage is not encrypted)
- Clear data on logout (if authentication added)

### Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Sufficient color contrast using Tailwind CSS v4's enhanced accessibility features
- Focus indicators with Tailwind's improved focus utilities
- Responsive design with Tailwind's mobile-first approach
- Leverage React 19's improved accessibility features and better screen reader support
