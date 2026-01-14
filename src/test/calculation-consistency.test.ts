import { describe, it, expect, beforeEach } from "vitest";
import {
	calculateLineItemTotal,
	calculateInvoiceSubtotal,
	calculateInvoiceTotals,
} from "../utils";
import type { LineItem, Client } from "../types";
import { InvoiceManager } from "../services/InvoiceManager";
import { StorageService } from "../services/StorageService";

describe("Calculation Consistency", () => {
	describe("calculateLineItemTotal", () => {
		it("calculates total using only quantity and unitPrice when totalQuantity is not provided", () => {
			const quantity = 5;
			const unitPrice = 100;
			const total = calculateLineItemTotal(quantity, unitPrice);
			expect(total).toBe(500);
		});

		it("calculates total using totalQuantity when provided", () => {
			const quantity = 5;
			const unitPrice = 100;
			const totalQuantity = 10;
			const total = calculateLineItemTotal(quantity, unitPrice, totalQuantity);
			expect(total).toBe(1000); // Uses totalQuantity (10) instead of quantity (5)
		});

		it("handles decimal calculations correctly with totalQuantity", () => {
			const quantity = 2.5;
			const unitPrice = 99.99;
			const totalQuantity = 3.5;
			const total = calculateLineItemTotal(quantity, unitPrice, totalQuantity);
			expect(total).toBe(349.97); // 3.5 * 99.99 = 349.965, rounded to 349.97
		});

		it("handles decimal calculations correctly without totalQuantity", () => {
			const quantity = 2.5;
			const unitPrice = 99.99;
			const total = calculateLineItemTotal(quantity, unitPrice);
			expect(total).toBe(249.98); // 2.5 * 99.99 = 249.975, rounded to 249.98
		});
	});

	describe("calculateInvoiceSubtotal", () => {
		it("calculates subtotal using totalQuantity when provided, otherwise main quantity", () => {
			const lineItems: LineItem[] = [
				{
					id: "1",
					description: "Item 1",
					quantity: 2,
					unitPrice: 100,
					total: 200,
					unit: "pieces",
					totalQuantity: 10, // This should be used for calculation
				},
				{
					id: "2",
					description: "Item 2",
					quantity: 3,
					unitPrice: 50,
					total: 150,
					unit: "sq ft",
					// No totalQuantity, so main quantity should be used
				},
			];

			const subtotal = calculateInvoiceSubtotal(lineItems);
			// Should be (10 * 100) + (3 * 50) = 1000 + 150 = 1150
			expect(subtotal).toBe(1150);
		});

		it("works correctly with line items without totalQuantity", () => {
			const lineItems: LineItem[] = [
				{
					id: "1",
					description: "Item 1",
					quantity: 2,
					unitPrice: 100,
					total: 200,
				},
				{
					id: "2",
					description: "Item 2",
					quantity: 3,
					unitPrice: 50,
					total: 150,
				},
			];

			const subtotal = calculateInvoiceSubtotal(lineItems);
			expect(subtotal).toBe(350);
		});
	});

	describe("calculateInvoiceTotals", () => {
		it("calculates all totals using totalQuantity when provided, otherwise main quantity", () => {
			const lineItemsInput = [
				{
					id: "1",
					description: "Item 1",
					quantity: 2,
					unitPrice: 100,
					unit: "pieces",
					totalQuantity: 10, // This should be used for calculation
				},
				{
					id: "2",
					description: "Item 2",
					quantity: 3,
					unitPrice: 50,
					unit: "sq ft",
					// No totalQuantity, so main quantity should be used
				},
			];

			const result = calculateInvoiceTotals(lineItemsInput, 0);

			// Verify line item totals use totalQuantity when provided
			expect(result.lineItems[0].total).toBe(1000); // 10 * 100 (using totalQuantity)
			expect(result.lineItems[1].total).toBe(150); // 3 * 50 (using main quantity)

			// Verify subtotal uses correct quantities
			expect(result.subtotal).toBe(1150); // 1000 + 150

			// Verify final total
			expect(result.total).toBe(1150); // No tax
		});

		it("preserves totalQuantity field in output and uses it for calculations", () => {
			const lineItemsInput = [
				{
					id: "1",
					description: "Item 1",
					quantity: 2,
					unitPrice: 100,
					unit: "pieces",
					totalQuantity: 10,
				},
			];

			const result = calculateInvoiceTotals(lineItemsInput, 0);

			// Verify totalQuantity is preserved in output
			expect(result.lineItems[0].totalQuantity).toBe(10);

			// And calculation uses totalQuantity
			expect(result.lineItems[0].total).toBe(1000); // 10 * 100 (using totalQuantity)
		});
	});

	describe("InvoiceManager calculation consistency", () => {
		let invoiceManager: InvoiceManager;
		let storageService: StorageService;

		beforeEach(() => {
			storageService = new StorageService();
			invoiceManager = new InvoiceManager(storageService);
		});

		it("addLineItem calculates total using totalQuantity when provided", () => {
			// Create a test client first
			const client: Client = {
				id: "test-client-1",
				name: "Test Client",
				address: "123 Test St",
				phone: "123-456-7890",
				email: "test@example.com",
				createdAt: Date.now(),
			};
			storageService.saveClient(client);
			const savedClient = storageService.getAllClients()[0];

			// Create invoice
			const invoice = invoiceManager.createInvoice(savedClient.id);

			// Add line item with totalQuantity
			const lineItemData = {
				description: "Test Item",
				quantity: 3,
				unitPrice: 100,
				unit: "pieces",
				totalQuantity: 12, // This should be used for calculations
			};

			const updatedInvoice = invoiceManager.addLineItem(invoice, lineItemData);

			// Verify the line item total uses totalQuantity
			const addedItem = updatedInvoice.lineItems[0];
			expect(addedItem.total).toBe(1200); // 12 * 100 (using totalQuantity)
			expect(addedItem.totalQuantity).toBe(12); // Preserved and used

			// Verify invoice totals
			expect(updatedInvoice.subtotal).toBe(1200);
			expect(updatedInvoice.total).toBe(1200);
		});

		it("updateLineItem calculates total using totalQuantity when provided", () => {
			// Create a test client first
			const client: Client = {
				id: "test-client-2",
				name: "Test Client",
				address: "123 Test St",
				phone: "123-456-7890",
				email: "test@example.com",
				createdAt: Date.now(),
			};
			storageService.saveClient(client);
			const savedClient = storageService.getAllClients()[0];

			// Create invoice with line item
			let invoice = invoiceManager.createInvoice(savedClient.id);
			invoice = invoiceManager.addLineItem(invoice, {
				description: "Test Item",
				quantity: 2,
				unitPrice: 50,
			});

			const lineItemId = invoice.lineItems[0].id;

			// Update line item with totalQuantity
			const updatedLineItem: LineItem = {
				id: lineItemId,
				description: "Updated Test Item",
				quantity: 4,
				unitPrice: 75,
				total: 1500, // This will be recalculated using totalQuantity (20 * 75)
				unit: "sq ft",
				totalQuantity: 20, // This should be used for calculations
			};

			const updatedInvoice = invoiceManager.updateLineItem(
				invoice,
				updatedLineItem
			);

			// Verify the line item total uses totalQuantity
			const updatedItem = updatedInvoice.lineItems[0];
			expect(updatedItem.total).toBe(1500); // 20 * 75 (using totalQuantity)
			expect(updatedItem.totalQuantity).toBe(20); // Preserved and used

			// Verify invoice totals
			expect(updatedInvoice.subtotal).toBe(1500);
			expect(updatedInvoice.total).toBe(1500);
		});

		it("calculateTotals method uses totalQuantity when provided", () => {
			// Create a test client first
			const client: Client = {
				id: "test-client-3",
				name: "Test Client",
				address: "123 Test St",
				phone: "123-456-7890",
				email: "test@example.com",
				createdAt: Date.now(),
			};
			storageService.saveClient(client);
			const savedClient = storageService.getAllClients()[0];

			// Create invoice with enhanced line items
			const invoice = invoiceManager.createInvoice(savedClient.id);
			invoice.lineItems = [
				{
					id: "1",
					description: "Item 1",
					quantity: 2,
					unitPrice: 100,
					total: 0, // Will be recalculated
					unit: "pieces",
					totalQuantity: 8,
				},
				{
					id: "2",
					description: "Item 2",
					quantity: 3,
					unitPrice: 50,
					total: 0, // Will be recalculated
					unit: "sq ft",
					totalQuantity: 12,
				},
			];

			const recalculatedInvoice = invoiceManager.calculateTotals(invoice);

			// Verify line item totals use totalQuantity
			expect(recalculatedInvoice.lineItems[0].total).toBe(800); // 8 * 100 (using totalQuantity)
			expect(recalculatedInvoice.lineItems[1].total).toBe(600); // 12 * 50 (using totalQuantity)

			// Verify totalQuantity fields are preserved
			expect(recalculatedInvoice.lineItems[0].totalQuantity).toBe(8);
			expect(recalculatedInvoice.lineItems[1].totalQuantity).toBe(12);

			// Verify invoice totals
			expect(recalculatedInvoice.subtotal).toBe(1400); // 800 + 600
			expect(recalculatedInvoice.total).toBe(1400);
		});
	});

	describe("Backward compatibility", () => {
		it("calculates correctly for line items without enhanced fields", () => {
			const lineItems: LineItem[] = [
				{
					id: "1",
					description: "Legacy Item 1",
					quantity: 2,
					unitPrice: 100,
					total: 200,
					// No unit or totalQuantity fields
				},
				{
					id: "2",
					description: "Legacy Item 2",
					quantity: 3,
					unitPrice: 50,
					total: 150,
					// No unit or totalQuantity fields
				},
			];

			const subtotal = calculateInvoiceSubtotal(lineItems);
			expect(subtotal).toBe(350);

			const result = calculateInvoiceTotals(
				lineItems.map(({ total, ...item }) => item),
				0
			);
			expect(result.subtotal).toBe(350);
			expect(result.total).toBe(350);
		});

		it("handles mixed old and new format line items", () => {
			const lineItems: LineItem[] = [
				{
					id: "1",
					description: "Legacy Item",
					quantity: 2,
					unitPrice: 100,
					total: 200,
					// No enhanced fields - should use main quantity
				},
				{
					id: "2",
					description: "Enhanced Item",
					quantity: 3,
					unitPrice: 50,
					total: 150,
					unit: "sq ft",
					totalQuantity: 15, // Should use totalQuantity for calculation
				},
			];

			const subtotal = calculateInvoiceSubtotal(lineItems);
			expect(subtotal).toBe(950); // (2 * 100) + (15 * 50) = 200 + 750

			const result = calculateInvoiceTotals(
				lineItems.map(({ total, ...item }) => item),
				0
			);
			expect(result.subtotal).toBe(950);
			expect(result.total).toBe(950);
		});
	});
});
