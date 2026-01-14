import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StorageService } from "../services/StorageService";
import { InvoiceManager } from "../services/InvoiceManager";
import { ClientManager } from "../services/ClientManager";
import LineItemList from "../components/invoice/LineItemList";
import InvoiceTemplate from "../components/invoice/InvoiceTemplate";
import type { Client, LineItem } from "../types";

/**
 * Integration Tests - Complete User Workflows
 *
 * These tests validate end-to-end workflows by testing the integration
 * of multiple components working together. They focus on business logic
 * and data flow rather than UI interactions.
 */
describe("Integration Tests - Complete User Workflows", () => {
	let storage: StorageService;
	let invoiceManager: InvoiceManager;
	let clientManager: ClientManager;

	beforeEach(() => {
		// Clear local storage before each test
		localStorage.clear();
		// Initialize fresh instances
		storage = new StorageService();
		storage.clearAll();
		invoiceManager = new InvoiceManager(storage);
		clientManager = new ClientManager(storage);
	});

	describe("Complete workflow: Create client → Create invoice → Save → Retrieve", () => {
		it("should create a client, create an invoice for that client, save it, and retrieve it successfully", () => {
			// Step 1: Create a client
			const clientData = {
				name: "John Doe",
				address: "123 Main St, Springfield",
				phone: "555-1234",
				email: "john@example.com",
			};

			const client = clientManager.createClient(clientData);
			expect(client.id).toBeDefined();
			expect(client.name).toBe("John Doe");

			// Verify client was saved
			const savedClient = clientManager.getClient(client.id);
			expect(savedClient).toBeDefined();
			expect(savedClient?.name).toBe("John Doe");

			// Step 2: Create an invoice for this client
			const invoice = invoiceManager.createInvoice(client.id);
			expect(invoice.clientId).toBe(client.id);
			expect(invoice.client.name).toBe("John Doe");

			// Step 3: Add line items to the invoice
			const lineItem: Omit<LineItem, "id" | "total"> = {
				description: "Custom Cabinet",
				quantity: 2,
				unitPrice: 500,
			};

			const updatedInvoice = invoiceManager.addLineItem(invoice, lineItem);
			expect(updatedInvoice.lineItems).toHaveLength(1);
			expect(updatedInvoice.lineItems[0].description).toBe("Custom Cabinet");

			// Step 4: Calculate totals
			const invoiceWithTotals = invoiceManager.calculateTotals(updatedInvoice);
			expect(invoiceWithTotals.subtotal).toBe(1000);
			expect(invoiceWithTotals.total).toBe(1000);

			// Step 5: Save the invoice
			invoiceManager.saveInvoice(invoiceWithTotals);

			// Step 6: Retrieve and verify the invoice
			const retrievedInvoice = invoiceManager.getInvoice(invoiceWithTotals.id);
			expect(retrievedInvoice).toBeDefined();
			expect(retrievedInvoice?.client.name).toBe("John Doe");
			expect(retrievedInvoice?.lineItems).toHaveLength(1);
			expect(retrievedInvoice?.lineItems[0].description).toBe("Custom Cabinet");
			expect(retrievedInvoice?.total).toBe(1000);
		});
	});

	describe("Workflow: Search and filter clients", () => {
		it("should search clients by name and return correct results", () => {
			// Pre-populate with test data
			clientManager.createClient({
				name: "Alice Smith",
				address: "123 Oak St",
				phone: "555-0001",
				email: "alice@example.com",
			});
			clientManager.createClient({
				name: "Bob Johnson",
				address: "456 Pine St",
				phone: "555-0002",
				email: "bob@example.com",
			});
			clientManager.createClient({
				name: "Charlie Brown",
				address: "789 Elm St",
				phone: "555-0003",
				email: "charlie@example.com",
			});

			// Search for specific client
			const results = clientManager.searchClients("Alice");
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe("Alice Smith");

			// Search by email
			const emailResults = clientManager.searchClients("bob@example.com");
			expect(emailResults).toHaveLength(1);
			expect(emailResults[0].name).toBe("Bob Johnson");

			// Search with no results
			const noResults = clientManager.searchClients("NonExistent");
			expect(noResults).toHaveLength(0);
		});
	});

	describe("Workflow: Edit existing invoice", () => {
		it("should update an existing invoice and persist changes", () => {
			// Create a client
			const client = clientManager.createClient({
				name: "Test Client",
				address: "123 Test St",
				phone: "555-1111",
				email: "test@example.com",
			});

			// Create an invoice
			let invoice = invoiceManager.createInvoice(client.id);
			invoice = invoiceManager.addLineItem(invoice, {
				description: "Original Item",
				quantity: 1,
				unitPrice: 100,
			});
			invoice = invoiceManager.calculateTotals(invoice);
			invoiceManager.saveInvoice(invoice);

			// Retrieve the invoice
			const retrievedInvoice = invoiceManager.getInvoice(invoice.id);
			expect(retrievedInvoice).toBeDefined();
			expect(retrievedInvoice?.lineItems[0].description).toBe("Original Item");

			// Update the line item
			if (retrievedInvoice) {
				const updatedLineItem: LineItem = {
					...retrievedInvoice.lineItems[0],
					description: "Updated Item",
				};
				let updatedInvoice = invoiceManager.updateLineItem(
					retrievedInvoice,
					updatedLineItem
				);
				updatedInvoice = invoiceManager.calculateTotals(updatedInvoice);
				invoiceManager.saveInvoice(updatedInvoice);

				// Verify the update
				const finalInvoice = invoiceManager.getInvoice(invoice.id);
				expect(finalInvoice?.lineItems[0].description).toBe("Updated Item");
			}
		});
	});

	describe("Workflow: Delete invoice", () => {
		it("should delete an invoice and remove it from storage", () => {
			// Create a client
			const client = clientManager.createClient({
				name: "Test Client",
				address: "123 Test St",
				phone: "555-1111",
				email: "test@example.com",
			});

			// Create an invoice
			let invoice = invoiceManager.createInvoice(client.id);
			invoice = invoiceManager.addLineItem(invoice, {
				description: "Test Item",
				quantity: 1,
				unitPrice: 100,
			});
			invoice = invoiceManager.calculateTotals(invoice);
			invoiceManager.saveInvoice(invoice);

			// Verify invoice exists
			expect(invoiceManager.getAllInvoices()).toHaveLength(1);

			// Delete the invoice
			invoiceManager.deleteInvoice(invoice.id);

			// Verify invoice was deleted
			expect(invoiceManager.getAllInvoices()).toHaveLength(0);
			expect(invoiceManager.getInvoice(invoice.id)).toBeNull();
		});
	});

	describe("Workflow: Client update propagates to future invoices", () => {
		it("should reflect updated client information in newly created invoices", () => {
			// Create a client
			const client = clientManager.createClient({
				name: "Original Name",
				address: "123 Test St",
				phone: "555-1111",
				email: "original@example.com",
			});

			// Update the client
			const updatedClient: Client = {
				...client,
				name: "Updated Name",
				email: "updated@example.com",
			};
			clientManager.updateClient(updatedClient);

			// Verify client was updated
			const retrievedClient = clientManager.getClient(client.id);
			expect(retrievedClient?.name).toBe("Updated Name");
			expect(retrievedClient?.email).toBe("updated@example.com");

			// Create a new invoice with the updated client
			const invoice = invoiceManager.createInvoice(client.id);
			expect(invoice.client.name).toBe("Updated Name");
			expect(invoice.client.email).toBe("updated@example.com");
		});
	});

	describe("Workflow: Invoice number uniqueness", () => {
		it("should generate unique invoice numbers for multiple invoices", () => {
			// Create a client
			const client = clientManager.createClient({
				name: "Test Client",
				address: "123 Test St",
				phone: "555-1111",
				email: "test@example.com",
			});

			// Create multiple invoices with line items
			let invoice1 = invoiceManager.createInvoice(client.id);
			invoice1 = invoiceManager.addLineItem(invoice1, {
				description: "Item 1",
				quantity: 1,
				unitPrice: 100,
			});
			invoice1 = invoiceManager.calculateTotals(invoice1);
			invoiceManager.saveInvoice(invoice1);

			let invoice2 = invoiceManager.createInvoice(client.id);
			invoice2 = invoiceManager.addLineItem(invoice2, {
				description: "Item 2",
				quantity: 1,
				unitPrice: 200,
			});
			invoice2 = invoiceManager.calculateTotals(invoice2);
			invoiceManager.saveInvoice(invoice2);

			let invoice3 = invoiceManager.createInvoice(client.id);
			invoice3 = invoiceManager.addLineItem(invoice3, {
				description: "Item 3",
				quantity: 1,
				unitPrice: 300,
			});
			invoice3 = invoiceManager.calculateTotals(invoice3);
			invoiceManager.saveInvoice(invoice3);

			// Verify all invoice numbers are unique
			const invoiceNumbers = [
				invoice1.invoiceNumber,
				invoice2.invoiceNumber,
				invoice3.invoiceNumber,
			];
			const uniqueNumbers = new Set(invoiceNumbers);
			expect(uniqueNumbers.size).toBe(3);
		});
	});

	describe("Workflow: Invoice calculations", () => {
		it("should correctly calculate invoice totals with multiple line items", () => {
			// Create a client
			const client = clientManager.createClient({
				name: "Test Client",
				address: "123 Test St",
				phone: "555-1111",
				email: "test@example.com",
			});

			// Create an invoice
			let invoice = invoiceManager.createInvoice(client.id);

			// Add multiple line items
			invoice = invoiceManager.addLineItem(invoice, {
				description: "Item 1",
				quantity: 2,
				unitPrice: 100,
			});

			invoice = invoiceManager.addLineItem(invoice, {
				description: "Item 2",
				quantity: 3,
				unitPrice: 50,
			});

			invoice = invoiceManager.addLineItem(invoice, {
				description: "Item 3",
				quantity: 1,
				unitPrice: 75,
			});

			// Calculate totals
			invoice = invoiceManager.calculateTotals(invoice);

			// Verify calculations
			expect(invoice.lineItems).toHaveLength(3);
			expect(invoice.subtotal).toBe(425); // 200 + 150 + 75
			expect(invoice.total).toBe(425);
		});
	});

	describe("Workflow: Data persistence across sessions", () => {
		it("should persist data to local storage and retrieve it correctly", () => {
			// Create a client
			const client = clientManager.createClient({
				name: "Persistent Client",
				address: "123 Persistent St",
				phone: "555-9999",
				email: "persistent@example.com",
			});

			// Create an invoice
			let invoice = invoiceManager.createInvoice(client.id);
			invoice = invoiceManager.addLineItem(invoice, {
				description: "Persistent Item",
				quantity: 1,
				unitPrice: 100,
			});
			invoice = invoiceManager.calculateTotals(invoice);
			invoiceManager.saveInvoice(invoice);

			// Simulate a new session by creating new instances
			const newStorage = new StorageService();
			const newInvoiceManager = new InvoiceManager(newStorage);
			const newClientManager = new ClientManager(newStorage);

			// Verify data persisted
			const retrievedClient = newClientManager.getClient(client.id);
			expect(retrievedClient).toBeDefined();
			expect(retrievedClient?.name).toBe("Persistent Client");

			const retrievedInvoice = newInvoiceManager.getInvoice(invoice.id);
			expect(retrievedInvoice).toBeDefined();
			expect(retrievedInvoice?.lineItems[0].description).toBe(
				"Persistent Item"
			);
		});
	});

	describe("Workflow: Search invoices", () => {
		it("should search invoices by client name and invoice number", () => {
			// Create clients
			const client1 = clientManager.createClient({
				name: "Alice Smith",
				address: "123 Oak St",
				phone: "555-0001",
				email: "alice@example.com",
			});

			const client2 = clientManager.createClient({
				name: "Bob Johnson",
				address: "456 Pine St",
				phone: "555-0002",
				email: "bob@example.com",
			});

			// Create invoices
			let invoice1 = invoiceManager.createInvoice(client1.id);
			invoice1 = invoiceManager.addLineItem(invoice1, {
				description: "Item 1",
				quantity: 1,
				unitPrice: 100,
			});
			invoice1 = invoiceManager.calculateTotals(invoice1);
			invoiceManager.saveInvoice(invoice1);

			let invoice2 = invoiceManager.createInvoice(client2.id);
			invoice2 = invoiceManager.addLineItem(invoice2, {
				description: "Item 2",
				quantity: 1,
				unitPrice: 200,
			});
			invoice2 = invoiceManager.calculateTotals(invoice2);
			invoiceManager.saveInvoice(invoice2);

			// Search by client name
			const aliceInvoices = invoiceManager.searchInvoices("Alice");
			expect(aliceInvoices).toHaveLength(1);
			expect(aliceInvoices[0].client.name).toBe("Alice Smith");

			// Search by invoice number
			const invoiceByNumber = invoiceManager.searchInvoices(
				invoice1.invoiceNumber
			);
			expect(invoiceByNumber).toHaveLength(1);
			expect(invoiceByNumber[0].id).toBe(invoice1.id);
		});
	});

	describe("Enhanced Line Items - Complete Workflow", () => {
		it("should create, save, display, and print invoices with enhanced line items (unit and totalQuantity)", () => {
			// Step 1: Create a client
			const client = clientManager.createClient({
				name: "Enhanced Client",
				address: "456 Enhanced Street, New City, NC 67890",
				phone: "(555) 987-6543",
				email: "enhanced@example.com",
			});

			// Step 2: Create an invoice
			let invoice = invoiceManager.createInvoice(client.id);
			expect(invoice.clientId).toBe(client.id);
			expect(invoice.client.name).toBe("Enhanced Client");

			// Step 3: Add enhanced line items with unit and totalQuantity
			const enhancedLineItem1: Omit<LineItem, "id" | "total"> = {
				description: "Custom Kitchen Cabinets",
				quantity: 12,
				unitPrice: 150,
				unit: "sq ft",
				totalQuantity: 144, // 12 sq ft per cabinet, 12 cabinets = 144 total sq ft
			};

			const enhancedLineItem2: Omit<LineItem, "id" | "total"> = {
				description: "Hardwood Flooring Installation",
				quantity: 500,
				unitPrice: 8.5,
				unit: "sq ft",
				totalQuantity: 500, // Same as quantity in this case
			};

			const enhancedLineItem3: Omit<LineItem, "id" | "total"> = {
				description: "Door Installation",
				quantity: 3,
				unitPrice: 200,
				unit: "piece",
				totalQuantity: 6, // 2 doors per opening, 3 openings = 6 doors
			};

			// Add line items to invoice
			invoice = invoiceManager.addLineItem(invoice, enhancedLineItem1);
			invoice = invoiceManager.addLineItem(invoice, enhancedLineItem2);
			invoice = invoiceManager.addLineItem(invoice, enhancedLineItem3);

			// Verify line items were added with enhanced fields
			expect(invoice.lineItems).toHaveLength(3);
			expect(invoice.lineItems[0].unit).toBe("sq ft");
			expect(invoice.lineItems[0].totalQuantity).toBe(144);
			expect(invoice.lineItems[1].unit).toBe("sq ft");
			expect(invoice.lineItems[1].totalQuantity).toBe(500);
			expect(invoice.lineItems[2].unit).toBe("piece");
			expect(invoice.lineItems[2].totalQuantity).toBe(6);

			// Step 4: Calculate totals (should use totalQuantity when provided)
			invoice = invoiceManager.calculateTotals(invoice);
			expect(invoice.lineItems[0].total).toBe(21600); // 144 * 150 (using totalQuantity)
			expect(invoice.lineItems[1].total).toBe(4250); // 500 * 8.50 (totalQuantity same as quantity)
			expect(invoice.lineItems[2].total).toBe(1200); // 6 * 200 (using totalQuantity)
			expect(invoice.subtotal).toBe(27050); // 21600 + 4250 + 1200
			expect(invoice.total).toBe(27050);

			// Step 5: Save the invoice
			invoiceManager.saveInvoice(invoice);

			// Step 6: Retrieve and verify persistence of enhanced fields
			const retrievedInvoice = invoiceManager.getInvoice(invoice.id);
			expect(retrievedInvoice).toBeDefined();
			expect(retrievedInvoice?.lineItems).toHaveLength(3);

			// Verify all enhanced fields persisted correctly
			expect(retrievedInvoice?.lineItems[0].unit).toBe("sq ft");
			expect(retrievedInvoice?.lineItems[0].totalQuantity).toBe(144);
			expect(retrievedInvoice?.lineItems[1].unit).toBe("sq ft");
			expect(retrievedInvoice?.lineItems[1].totalQuantity).toBe(500);
			expect(retrievedInvoice?.lineItems[2].unit).toBe("piece");
			expect(retrievedInvoice?.lineItems[2].totalQuantity).toBe(6);

			// Verify calculations remain correct after persistence
			expect(retrievedInvoice?.lineItems[0].total).toBe(21600); // 144 * 150 (using totalQuantity)
			expect(retrievedInvoice?.lineItems[1].total).toBe(4250); // 500 * 8.50 (totalQuantity same as quantity)
			expect(retrievedInvoice?.lineItems[2].total).toBe(1200); // 6 * 200 (using totalQuantity)
			expect(retrievedInvoice?.total).toBe(27050);

			// Step 7: Test display in list view (render LineItemList component)
			if (retrievedInvoice) {
				const { container } = render(
					<LineItemList
						lineItems={retrievedInvoice.lineItems}
						showActions={false}
					/>
				);

				// Verify table structure with new column order
				expect(screen.getByText("Sr. No.")).toBeInTheDocument();
				expect(screen.getByText("Description")).toBeInTheDocument();
				expect(screen.getByText("Quantity")).toBeInTheDocument();
				expect(screen.getAllByText("Rate").length).toBeGreaterThanOrEqual(1);
				expect(screen.getByText("Per")).toBeInTheDocument();
				expect(screen.getByText("Amount")).toBeInTheDocument();

				// Verify enhanced line items display correctly
				expect(screen.getByText("Custom Kitchen Cabinets")).toBeInTheDocument();
				expect(
					screen.getByText("Hardwood Flooring Installation")
				).toBeInTheDocument();
				expect(screen.getByText("Door Installation")).toBeInTheDocument();

				// Verify units display in Per column
				const sqFtElements = screen.getAllByText("sq ft");
				expect(sqFtElements.length).toBeGreaterThanOrEqual(2); // At least two items with "sq ft" (in Per column and next to total quantity)
				expect(screen.getAllByText("piece").length).toBeGreaterThanOrEqual(1);

				// Verify total quantities display below main quantities (look for specific styling)
				const totalQuantityElements = container.querySelectorAll(
					".text-xs.text-gray-600"
				);
				expect(totalQuantityElements).toHaveLength(3);
				expect(totalQuantityElements[0].textContent).toContain("144");
				expect(totalQuantityElements[1].textContent).toContain("500");
				expect(totalQuantityElements[2].textContent).toContain("6");

				// Verify amounts display correctly
				expect(container.textContent).toContain("21600.00"); // 144 * 150 (using totalQuantity)
				expect(container.textContent).toContain("4250.00"); // 500 * 8.50 (totalQuantity same as quantity)
				expect(container.textContent).toContain("1200.00"); // 6 * 200 (using totalQuantity)
			}

			// Step 8: Test print template formatting
			if (retrievedInvoice) {
				const { container } = render(
					<InvoiceTemplate invoice={retrievedInvoice} />
				);

				// Verify print template includes enhanced fields
				expect(screen.getByText("INVOICE")).toBeInTheDocument();
				expect(screen.getByText("Enhanced Client")).toBeInTheDocument();

				// Verify table headers in print template
				expect(screen.getByText("Particulars")).toBeInTheDocument();
				expect(screen.getByText("Qty.")).toBeInTheDocument();
				expect(screen.getAllByText("Per")).toHaveLength(2); // Header and column
				expect(screen.getByText("Amount Rs.")).toBeInTheDocument();

				// Verify enhanced fields appear in print template
				expect(screen.getAllByText("sq ft").length).toBeGreaterThanOrEqual(2);
				expect(screen.getAllByText("piece").length).toBeGreaterThanOrEqual(1);

				// Verify total quantities appear in print format (in parentheses)
				expect(screen.getByText("(144)")).toBeInTheDocument();
				expect(screen.getByText("(500)")).toBeInTheDocument();
				expect(screen.getByText("(6)")).toBeInTheDocument();

				// Verify totals in print template
				expect(container.textContent).toContain("27,050.00"); // Updated total using totalQuantity
			}
		});

		it("should handle enhanced line items with only unit field (no totalQuantity)", () => {
			// Create client
			const client = clientManager.createClient({
				name: "Unit Only Client",
				address: "789 Unit Street",
				phone: "555-1111",
				email: "unit@example.com",
			});

			// Create invoice with line items that have unit but no totalQuantity
			let invoice = invoiceManager.createInvoice(client.id);

			const lineItemWithUnitOnly: Omit<LineItem, "id" | "total"> = {
				description: "Tile Installation",
				quantity: 100,
				unitPrice: 12,
				unit: "sq ft",
				// No totalQuantity field
			};

			invoice = invoiceManager.addLineItem(invoice, lineItemWithUnitOnly);
			invoice = invoiceManager.calculateTotals(invoice);
			invoiceManager.saveInvoice(invoice);

			// Retrieve and verify
			const retrievedInvoice = invoiceManager.getInvoice(invoice.id);
			expect(retrievedInvoice?.lineItems[0].unit).toBe("sq ft");
			expect(retrievedInvoice?.lineItems[0].totalQuantity).toBeUndefined();

			// Test display
			if (retrievedInvoice) {
				render(
					<LineItemList
						lineItems={retrievedInvoice.lineItems}
						showActions={false}
					/>
				);

				// Verify unit displays but no total quantity
				expect(screen.getByText("sq ft")).toBeInTheDocument();
				expect(screen.queryByText(/Total:/)).not.toBeInTheDocument();
			}
		});

		it("should handle enhanced line items with only totalQuantity field (no unit)", () => {
			// Create client
			const client = clientManager.createClient({
				name: "Quantity Only Client",
				address: "321 Quantity Ave",
				phone: "555-2222",
				email: "quantity@example.com",
			});

			// Create invoice with line items that have totalQuantity but no unit
			let invoice = invoiceManager.createInvoice(client.id);

			const lineItemWithQuantityOnly: Omit<LineItem, "id" | "total"> = {
				description: "Bulk Material Supply",
				quantity: 5,
				unitPrice: 50,
				totalQuantity: 25,
				// No unit field
			};

			invoice = invoiceManager.addLineItem(invoice, lineItemWithQuantityOnly);
			invoice = invoiceManager.calculateTotals(invoice);
			invoiceManager.saveInvoice(invoice);

			// Retrieve and verify
			const retrievedInvoice = invoiceManager.getInvoice(invoice.id);
			expect(retrievedInvoice?.lineItems[0].unit).toBeUndefined();
			expect(retrievedInvoice?.lineItems[0].totalQuantity).toBe(25);

			// Test display
			if (retrievedInvoice) {
				const { container } = render(
					<LineItemList
						lineItems={retrievedInvoice.lineItems}
						showActions={false}
					/>
				);

				// Verify total quantity displays but Per column is empty (look for specific styling)
				const totalQuantityElement = container.querySelector(
					".text-xs.text-gray-600"
				);
				expect(totalQuantityElement?.textContent).toContain("25");

				// Check that Per column (5th column) is empty
				const perColumnCells = container.querySelectorAll("td:nth-child(5)");
				expect(perColumnCells[0].textContent?.trim()).toBe("");
			}
		});

		it("should search enhanced invoices correctly", () => {
			// Create client
			const client = clientManager.createClient({
				name: "Search Test Client",
				address: "Search Street",
				phone: "555-3333",
				email: "search@example.com",
			});

			// Create multiple invoices with enhanced line items
			let invoice1 = invoiceManager.createInvoice(client.id);
			invoice1 = invoiceManager.addLineItem(invoice1, {
				description: "Enhanced Cabinets",
				quantity: 10,
				unitPrice: 100,
				unit: "pieces",
				totalQuantity: 20,
			});
			invoice1 = invoiceManager.calculateTotals(invoice1);
			invoiceManager.saveInvoice(invoice1);

			let invoice2 = invoiceManager.createInvoice(client.id);
			invoice2 = invoiceManager.addLineItem(invoice2, {
				description: "Enhanced Flooring",
				quantity: 200,
				unitPrice: 15,
				unit: "sq ft",
				totalQuantity: 200,
			});
			invoice2 = invoiceManager.calculateTotals(invoice2);
			invoiceManager.saveInvoice(invoice2);

			// Search by client name
			const searchResults = invoiceManager.searchInvoices("Search Test Client");
			expect(searchResults).toHaveLength(2);

			// Verify enhanced fields are preserved in search results
			const cabinetInvoice = searchResults.find((inv) =>
				inv.lineItems.some((item) => item.description === "Enhanced Cabinets")
			);
			const flooringInvoice = searchResults.find((inv) =>
				inv.lineItems.some((item) => item.description === "Enhanced Flooring")
			);

			expect(cabinetInvoice?.lineItems[0].unit).toBe("pieces");
			expect(cabinetInvoice?.lineItems[0].totalQuantity).toBe(20);
			expect(flooringInvoice?.lineItems[0].unit).toBe("sq ft");
			expect(flooringInvoice?.lineItems[0].totalQuantity).toBe(200);
		});
	});
});
