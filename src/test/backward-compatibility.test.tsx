import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StorageService } from "../services/StorageService";
import { InvoiceManager } from "../services/InvoiceManager";
import { ClientManager } from "../services/ClientManager";
import LineItemList from "../components/invoice/LineItemList";
import InvoiceTemplate from "../components/invoice/InvoiceTemplate";
import type { Client, Invoice, LineItem } from "../types";

/**
 * Backward Compatibility Tests
 *
 * These tests verify that existing invoices created before the enhancement
 * (without unit and totalQuantity fields) display correctly with the new
 * table structure and don't cause errors.
 *
 * Requirements tested: 4.2, 4.4
 */
describe("Backward Compatibility Tests", () => {
	let storage: StorageService;
	let invoiceManager: InvoiceManager;
	let clientManager: ClientManager;
	let mockClient: Client;

	beforeEach(() => {
		// Clear local storage before each test
		localStorage.clear();
		// Initialize fresh instances
		storage = new StorageService();
		storage.clearAll();
		invoiceManager = new InvoiceManager(storage);
		clientManager = new ClientManager(storage);

		// Create a mock client
		mockClient = clientManager.createClient({
			name: "Legacy Client",
			address: "123 Legacy Street, Old City, OC 12345",
			phone: "(555) 123-4567",
			email: "legacy@example.com",
		});
	});

	describe("Legacy LineItem Display", () => {
		it("should display old format line items without unit and totalQuantity fields", () => {
			// Create legacy line items (without unit and totalQuantity)
			const legacyLineItems: LineItem[] = [
				{
					id: "legacy-item-1",
					description: "Legacy Cabinet Installation",
					quantity: 2,
					unitPrice: 500,
					total: 1000,
					// Note: no unit or totalQuantity fields
				},
				{
					id: "legacy-item-2",
					description: "Legacy Flooring Work",
					quantity: 50,
					unitPrice: 25,
					total: 1250,
					// Note: no unit or totalQuantity fields
				},
			];

			render(<LineItemList lineItems={legacyLineItems} showActions={false} />);

			// Verify table headers are present (new structure)
			expect(screen.getByText("Sr. No.")).toBeInTheDocument();
			expect(screen.getByText("Description")).toBeInTheDocument();
			expect(screen.getByText("Quantity")).toBeInTheDocument();
			expect(screen.getAllByText("Rate").length).toBeGreaterThanOrEqual(1);
			expect(screen.getByText("Per")).toBeInTheDocument();
			expect(screen.getByText("Amount")).toBeInTheDocument();

			// Verify legacy line items display correctly
			expect(
				screen.getByText("Legacy Cabinet Installation")
			).toBeInTheDocument();
			expect(screen.getByText("Legacy Flooring Work")).toBeInTheDocument();

			// Verify quantities display correctly (no total quantity shown)
			const quantityCells = screen.getAllByText("2");
			expect(quantityCells.length).toBeGreaterThan(0);
			const quantityCells50 = screen.getAllByText("50");
			expect(quantityCells50.length).toBeGreaterThan(0);

			// Verify Per column is empty for legacy items (no unit field)
			const perColumnCells = document.querySelectorAll("td:nth-child(5)");
			perColumnCells.forEach((cell) => {
				// Per column should be empty for legacy items
				expect(cell.textContent?.trim()).toBe("");
			});

			// Verify amounts display correctly (use text content matching)
			expect(document.body.textContent).toContain("1000.00");
			expect(document.body.textContent).toContain("1250.00");

			// Verify no "Total:" text appears (no totalQuantity)
			expect(screen.queryByText("Total:")).not.toBeInTheDocument();
		});

		it("should handle mixed old and new format line items in the same list", () => {
			// Create mixed line items (some with new fields, some without)
			const mixedLineItems: LineItem[] = [
				{
					id: "legacy-item",
					description: "Legacy Item",
					quantity: 1,
					unitPrice: 100,
					total: 100,
					// No unit or totalQuantity
				},
				{
					id: "enhanced-item",
					description: "Enhanced Item",
					quantity: 2,
					unitPrice: 150,
					total: 300,
					unit: "sq ft",
					totalQuantity: 25,
				},
			];

			render(<LineItemList lineItems={mixedLineItems} showActions={false} />);

			// Verify both items display
			expect(screen.getByText("Legacy Item")).toBeInTheDocument();
			expect(screen.getByText("Enhanced Item")).toBeInTheDocument();

			// Verify legacy item has empty Per column
			const rows = screen.getAllByRole("row");
			const legacyRow = rows.find((row) =>
				row.textContent?.includes("Legacy Item")
			);
			expect(legacyRow).toBeDefined();

			// Verify enhanced item shows unit and total quantity
			expect(screen.getAllByText("sq ft").length).toBeGreaterThanOrEqual(1);
			expect(screen.getByText("25")).toBeInTheDocument();

			// Verify no errors occur with mixed format (use text content matching)
			expect(document.body.textContent).toContain("100.00");
			expect(document.body.textContent).toContain("300.00");
		});
	});

	describe("Legacy Invoice Template Display", () => {
		it("should render legacy invoices correctly in print template", () => {
			// Create a legacy invoice
			const legacyInvoice: Invoice = {
				id: "legacy-invoice-1",
				invoiceNumber: "INV-LEGACY-001",
				clientId: mockClient.id,
				client: mockClient,
				lineItems: [
					{
						id: "legacy-item-1",
						description: "Legacy Service",
						quantity: 3,
						unitPrice: 200,
						total: 600,
						// No unit or totalQuantity fields
					},
				],
				subtotal: 600,
				tax: 0,
				total: 600,
				issueDate: Date.now(),
				dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
				notes: "Legacy invoice notes",
				status: "issued",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};

			render(<InvoiceTemplate invoice={legacyInvoice} />);

			// Verify invoice renders without errors
			expect(screen.getByText("INVOICE")).toBeInTheDocument();
			expect(screen.getByText("INV-LEGACY-001")).toBeInTheDocument();
			expect(screen.getByText("Legacy Client")).toBeInTheDocument();
			expect(screen.getByText("Legacy Service")).toBeInTheDocument();

			// Verify table structure includes new columns
			expect(screen.getByText("Particulars")).toBeInTheDocument();
			expect(screen.getByText("Qty.")).toBeInTheDocument();
			expect(screen.getAllByText("Rate").length).toBeGreaterThanOrEqual(1);
			expect(screen.getByText("Per")).toBeInTheDocument();
			expect(screen.getByText("Amount Rs.")).toBeInTheDocument();

			// Verify legacy item displays correctly (use text content matching)
			expect(screen.getByText("3")).toBeInTheDocument(); // quantity
			expect(document.body.textContent).toContain("200.00"); // rate
			expect(document.body.textContent).toContain("600.00"); // total

			// Verify Per column is empty (no unit)
			const tableRows = document.querySelectorAll("tbody tr");
			expect(tableRows.length).toBe(1);
			const perCell = tableRows[0].querySelector("td:nth-child(5)");
			expect(perCell?.textContent?.trim()).toBe("");

			// Verify no total quantity display (look specifically for quantity parentheses, not phone numbers)
			const quantityParentheses = screen.queryByText(/\(\d+\)$/, {
				selector: "div",
			});
			expect(quantityParentheses).not.toBeInTheDocument();
		});
	});

	describe("Legacy Data Storage and Retrieval", () => {
		it("should save and retrieve legacy invoices without errors", () => {
			// Create a legacy invoice with old format line items
			let legacyInvoice = invoiceManager.createInvoice(mockClient.id);

			// Add legacy line item (without unit and totalQuantity)
			const legacyLineItem: Omit<LineItem, "id" | "total"> = {
				description: "Legacy Carpentry Work",
				quantity: 5,
				unitPrice: 80,
			};

			legacyInvoice = invoiceManager.addLineItem(legacyInvoice, legacyLineItem);
			legacyInvoice = invoiceManager.calculateTotals(legacyInvoice);

			// Save the invoice
			invoiceManager.saveInvoice(legacyInvoice);

			// Retrieve the invoice
			const retrievedInvoice = invoiceManager.getInvoice(legacyInvoice.id);

			// Verify invoice was saved and retrieved correctly
			expect(retrievedInvoice).toBeDefined();
			expect(retrievedInvoice?.lineItems).toHaveLength(1);
			expect(retrievedInvoice?.lineItems[0].description).toBe(
				"Legacy Carpentry Work"
			);
			expect(retrievedInvoice?.lineItems[0].quantity).toBe(5);
			expect(retrievedInvoice?.lineItems[0].unitPrice).toBe(80);
			expect(retrievedInvoice?.lineItems[0].total).toBe(400);

			// Verify new fields are undefined (not present)
			expect(retrievedInvoice?.lineItems[0].unit).toBeUndefined();
			expect(retrievedInvoice?.lineItems[0].totalQuantity).toBeUndefined();
		});

		it("should handle search functionality with legacy invoices", () => {
			// Create multiple legacy invoices
			let invoice1 = invoiceManager.createInvoice(mockClient.id);
			invoice1 = invoiceManager.addLineItem(invoice1, {
				description: "Legacy Kitchen Cabinets",
				quantity: 1,
				unitPrice: 1000,
			});
			invoice1 = invoiceManager.calculateTotals(invoice1);
			invoiceManager.saveInvoice(invoice1);

			let invoice2 = invoiceManager.createInvoice(mockClient.id);
			invoice2 = invoiceManager.addLineItem(invoice2, {
				description: "Legacy Bathroom Renovation",
				quantity: 1,
				unitPrice: 1500,
			});
			invoice2 = invoiceManager.calculateTotals(invoice2);
			invoiceManager.saveInvoice(invoice2);

			// Search by client name
			const searchResults = invoiceManager.searchInvoices("Legacy Client");
			expect(searchResults).toHaveLength(2);

			// Verify both invoices are found
			const descriptions = searchResults.flatMap((inv) =>
				inv.lineItems.map((item) => item.description)
			);
			expect(descriptions).toContain("Legacy Kitchen Cabinets");
			expect(descriptions).toContain("Legacy Bathroom Renovation");

			// Search by invoice number
			const invoiceNumberSearch = invoiceManager.searchInvoices(
				invoice1.invoiceNumber
			);
			expect(invoiceNumberSearch).toHaveLength(1);
			expect(invoiceNumberSearch[0].id).toBe(invoice1.id);
		});

		it("should handle mixed legacy and enhanced invoices in search results", () => {
			// Create a legacy invoice
			let legacyInvoice = invoiceManager.createInvoice(mockClient.id);
			legacyInvoice = invoiceManager.addLineItem(legacyInvoice, {
				description: "Legacy Work",
				quantity: 1,
				unitPrice: 500,
			});
			legacyInvoice = invoiceManager.calculateTotals(legacyInvoice);
			invoiceManager.saveInvoice(legacyInvoice);

			// Create an enhanced invoice (simulate having unit and totalQuantity)
			let enhancedInvoice = invoiceManager.createInvoice(mockClient.id);
			enhancedInvoice = invoiceManager.addLineItem(enhancedInvoice, {
				description: "Enhanced Work",
				quantity: 2,
				unitPrice: 300,
			});
			// Manually add enhanced fields to simulate new format
			enhancedInvoice.lineItems[0].unit = "pieces";
			enhancedInvoice.lineItems[0].totalQuantity = 10;
			enhancedInvoice = invoiceManager.calculateTotals(enhancedInvoice);
			invoiceManager.saveInvoice(enhancedInvoice);

			// Search for all invoices
			const allInvoices = invoiceManager.searchInvoices("Legacy Client");
			expect(allInvoices).toHaveLength(2);

			// Verify mixed format handling
			const legacyResult = allInvoices.find((inv) =>
				inv.lineItems.some((item) => item.description === "Legacy Work")
			);
			const enhancedResult = allInvoices.find((inv) =>
				inv.lineItems.some((item) => item.description === "Enhanced Work")
			);

			expect(legacyResult).toBeDefined();
			expect(enhancedResult).toBeDefined();

			// Verify legacy invoice has no enhanced fields
			expect(legacyResult?.lineItems[0].unit).toBeUndefined();
			expect(legacyResult?.lineItems[0].totalQuantity).toBeUndefined();

			// Verify enhanced invoice has enhanced fields
			expect(enhancedResult?.lineItems[0].unit).toBe("pieces");
			expect(enhancedResult?.lineItems[0].totalQuantity).toBe(10);
		});
	});

	describe("Legacy Invoice Calculations", () => {
		it("should calculate totals correctly for legacy invoices", () => {
			// Create legacy invoice with multiple line items
			let legacyInvoice = invoiceManager.createInvoice(mockClient.id);

			// Add multiple legacy line items
			legacyInvoice = invoiceManager.addLineItem(legacyInvoice, {
				description: "Legacy Item 1",
				quantity: 2,
				unitPrice: 100,
			});

			legacyInvoice = invoiceManager.addLineItem(legacyInvoice, {
				description: "Legacy Item 2",
				quantity: 3,
				unitPrice: 150,
			});

			// Calculate totals
			legacyInvoice = invoiceManager.calculateTotals(legacyInvoice);

			// Verify calculations are correct
			expect(legacyInvoice.lineItems).toHaveLength(2);
			expect(legacyInvoice.lineItems[0].total).toBe(200); // 2 * 100
			expect(legacyInvoice.lineItems[1].total).toBe(450); // 3 * 150
			expect(legacyInvoice.subtotal).toBe(650); // 200 + 450
			expect(legacyInvoice.total).toBe(650); // same as subtotal (no tax)
		});
	});

	describe("Error Handling for Legacy Data", () => {
		it("should not throw errors when rendering legacy line items with undefined enhanced fields", () => {
			// Create line items with explicitly undefined enhanced fields
			const legacyLineItems: LineItem[] = [
				{
					id: "test-item",
					description: "Test Item",
					quantity: 1,
					unitPrice: 100,
					total: 100,
					unit: undefined,
					totalQuantity: undefined,
				},
			];

			// Should not throw any errors
			expect(() => {
				render(
					<LineItemList lineItems={legacyLineItems} showActions={false} />
				);
			}).not.toThrow();

			// Verify item displays correctly (use text content matching)
			expect(screen.getByText("Test Item")).toBeInTheDocument();
			const quantityElements = screen.getAllByText("1");
			expect(quantityElements.length).toBeGreaterThan(0); // appears in serial number and quantity
			expect(document.body.textContent).toContain("100.00");
		});

		it("should handle null values gracefully in enhanced fields", () => {
			// Create line items with null values (edge case)
			const lineItemsWithNulls: LineItem[] = [
				{
					id: "null-item",
					description: "Item with Nulls",
					quantity: 2,
					unitPrice: 50,
					total: 100,
					unit: null as any, // Simulate null value
					totalQuantity: null as any, // Simulate null value
				},
			];

			// Should not throw any errors
			expect(() => {
				render(
					<LineItemList lineItems={lineItemsWithNulls} showActions={false} />
				);
			}).not.toThrow();

			// Verify item displays correctly
			expect(screen.getByText("Item with Nulls")).toBeInTheDocument();
		});
	});

	describe("Complete Backward Compatibility Workflow", () => {
		it("should handle complete workflow: load legacy invoice → display → edit → save → print", () => {
			// Step 1: Create a legacy invoice (simulating data from before enhancement)
			let legacyInvoice = invoiceManager.createInvoice(mockClient.id);

			// Add legacy line items (without enhanced fields)
			const legacyLineItem: Omit<LineItem, "id" | "total"> = {
				description: "Legacy Cabinet Work",
				quantity: 3,
				unitPrice: 250,
			};

			legacyInvoice = invoiceManager.addLineItem(legacyInvoice, legacyLineItem);
			legacyInvoice = invoiceManager.calculateTotals(legacyInvoice);
			invoiceManager.saveInvoice(legacyInvoice);

			// Step 2: Load the legacy invoice
			const loadedInvoice = invoiceManager.getInvoice(legacyInvoice.id);
			expect(loadedInvoice).toBeDefined();
			expect(loadedInvoice?.lineItems[0].unit).toBeUndefined();
			expect(loadedInvoice?.lineItems[0].totalQuantity).toBeUndefined();

			// Step 3: Display in new table structure
			if (loadedInvoice) {
				const { container } = render(
					<LineItemList
						lineItems={loadedInvoice.lineItems}
						showActions={false}
					/>
				);

				// Verify new table structure displays legacy data correctly
				expect(screen.getByText("Sr. No.")).toBeInTheDocument();
				expect(screen.getByText("Per")).toBeInTheDocument(); // New column
				expect(screen.getByText("Legacy Cabinet Work")).toBeInTheDocument();

				// Verify Per column is empty for legacy item
				const perColumnCells = container.querySelectorAll("td:nth-child(5)");
				expect(perColumnCells[0].textContent?.trim()).toBe("");

				// Verify no total quantity display
				expect(container.textContent).not.toMatch(/Total:\s*\d+/);
			}

			// Step 4: Edit the invoice by adding a new enhanced line item
			if (loadedInvoice) {
				const enhancedLineItem: Omit<LineItem, "id" | "total"> = {
					description: "New Enhanced Work",
					quantity: 2,
					unitPrice: 150,
					unit: "pieces",
					totalQuantity: 4,
				};

				let updatedInvoice = invoiceManager.addLineItem(
					loadedInvoice,
					enhancedLineItem
				);
				updatedInvoice = invoiceManager.calculateTotals(updatedInvoice);
				invoiceManager.saveInvoice(updatedInvoice);

				// Verify mixed format handling
				const finalInvoice = invoiceManager.getInvoice(legacyInvoice.id);
				expect(finalInvoice?.lineItems).toHaveLength(2);
				expect(finalInvoice?.lineItems[0].unit).toBeUndefined(); // Legacy item
				expect(finalInvoice?.lineItems[1].unit).toBe("pieces"); // Enhanced item
			}

			// Step 5: Print the mixed format invoice
			const finalInvoice = invoiceManager.getInvoice(legacyInvoice.id);
			if (finalInvoice) {
				const { container } = render(
					<InvoiceTemplate invoice={finalInvoice} />
				);

				// Verify print template handles mixed format
				expect(
					screen.getAllByText("Legacy Cabinet Work").length
				).toBeGreaterThanOrEqual(1);
				expect(
					screen.getAllByText("New Enhanced Work").length
				).toBeGreaterThanOrEqual(1);
				expect(screen.getAllByText("pieces").length).toBeGreaterThanOrEqual(1);

				// Verify calculations are correct
				expect(container.textContent).toContain("1,350.00"); // 750 + 600 (using totalQuantity 4 * 150)
			}
		});

		it("should handle legacy invoice search and filtering without errors", () => {
			// Create multiple legacy invoices
			const legacyInvoices = [];

			for (let i = 0; i < 3; i++) {
				let invoice = invoiceManager.createInvoice(mockClient.id);
				invoice = invoiceManager.addLineItem(invoice, {
					description: `Legacy Service ${i + 1}`,
					quantity: i + 1,
					unitPrice: 100,
				});
				invoice = invoiceManager.calculateTotals(invoice);
				invoiceManager.saveInvoice(invoice);
				legacyInvoices.push(invoice);
			}

			// Search by client name
			const searchResults = invoiceManager.searchInvoices("Legacy Client");
			expect(searchResults.length).toBeGreaterThanOrEqual(3);

			// Verify all results are legacy format (no enhanced fields)
			searchResults.forEach((invoice) => {
				invoice.lineItems.forEach((item) => {
					expect(item.unit).toBeUndefined();
					expect(item.totalQuantity).toBeUndefined();
				});
			});

			// Search by invoice number
			const specificInvoice = invoiceManager.searchInvoices(
				legacyInvoices[0].invoiceNumber
			);
			expect(specificInvoice).toHaveLength(1);
			expect(specificInvoice[0].id).toBe(legacyInvoices[0].id);
		});

		it("should maintain data integrity when mixing legacy and enhanced invoices", () => {
			// Create a legacy invoice
			let legacyInvoice = invoiceManager.createInvoice(mockClient.id);
			legacyInvoice = invoiceManager.addLineItem(legacyInvoice, {
				description: "Legacy Item",
				quantity: 1,
				unitPrice: 100,
			});
			legacyInvoice = invoiceManager.calculateTotals(legacyInvoice);
			invoiceManager.saveInvoice(legacyInvoice);

			// Create an enhanced invoice
			let enhancedInvoice = invoiceManager.createInvoice(mockClient.id);
			enhancedInvoice = invoiceManager.addLineItem(enhancedInvoice, {
				description: "Enhanced Item",
				quantity: 2,
				unitPrice: 150,
			});
			// Manually add enhanced fields
			enhancedInvoice.lineItems[0].unit = "sq ft";
			enhancedInvoice.lineItems[0].totalQuantity = 20;
			enhancedInvoice = invoiceManager.calculateTotals(enhancedInvoice);
			invoiceManager.saveInvoice(enhancedInvoice);

			// Verify both invoices coexist correctly
			const allInvoices = invoiceManager.getAllInvoices();
			expect(allInvoices.length).toBeGreaterThanOrEqual(2);

			const legacyResult = allInvoices.find((inv) =>
				inv.lineItems.some((item) => item.description === "Legacy Item")
			);
			const enhancedResult = allInvoices.find((inv) =>
				inv.lineItems.some((item) => item.description === "Enhanced Item")
			);

			// Verify data integrity
			expect(legacyResult?.lineItems[0].unit).toBeUndefined();
			expect(legacyResult?.lineItems[0].totalQuantity).toBeUndefined();
			expect(legacyResult?.total).toBe(100);

			expect(enhancedResult?.lineItems[0].unit).toBe("sq ft");
			expect(enhancedResult?.lineItems[0].totalQuantity).toBe(20);
			expect(enhancedResult?.total).toBe(3000); // 20 * 150 (using totalQuantity)
		});
	});
});
