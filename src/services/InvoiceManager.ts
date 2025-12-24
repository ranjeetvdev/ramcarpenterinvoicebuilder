import type { Invoice, LineItem } from "../types";
import { validateInvoice, validateLineItem } from "../types";
import { StorageService } from "./StorageService";
import {
	generateId,
	getCurrentTimestamp,
	calculateInvoiceTotals,
} from "../utils";

/**
 * InvoiceManager handles all business logic operations for invoices
 * Provides CRUD operations, calculations, and search functionality
 */
export class InvoiceManager {
	private storageService: StorageService;

	constructor(storageService: StorageService) {
		this.storageService = storageService;
	}

	/**
	 * Create a new invoice for a client
	 */
	createInvoice(clientId: string): Invoice {
		// Validate client exists
		const client = this.storageService.getClient(clientId);
		if (!client) {
			throw new Error(`Client with ID ${clientId} not found`);
		}

		const now = getCurrentTimestamp();
		const invoiceNumber = this.storageService.getNextInvoiceNumber();

		const invoice: Invoice = {
			id: generateId(),
			invoiceNumber,
			clientId,
			client: { ...client }, // Embed client data for historical accuracy
			lineItems: [],
			subtotal: 0,
			tax: 0,
			total: 0,
			issueDate: now,
			dueDate: now + 30 * 24 * 60 * 60 * 1000, // Default 30 days from now
			notes: "",
			status: "draft",
			createdAt: now,
			updatedAt: now,
		};

		return invoice;
	}

	/**
	 * Add a line item to an invoice
	 */
	addLineItem(invoice: Invoice, item: Omit<LineItem, "id" | "total">): Invoice {
		// Validate line item
		const itemValidation = validateLineItem({
			...item,
			id: generateId(),
			total: item.quantity * item.unitPrice,
		});

		if (!itemValidation.isValid) {
			throw new Error(`Invalid line item: ${itemValidation.errors.join(", ")}`);
		}

		const newLineItem: LineItem = {
			...item,
			id: generateId(),
			total: item.quantity * item.unitPrice,
		};

		const updatedInvoice = {
			...invoice,
			lineItems: [...invoice.lineItems, newLineItem],
			updatedAt: getCurrentTimestamp(),
		};

		return this.calculateTotals(updatedInvoice);
	}

	/**
	 * Remove a line item from an invoice
	 */
	removeLineItem(invoice: Invoice, itemId: string): Invoice {
		const updatedInvoice = {
			...invoice,
			lineItems: invoice.lineItems.filter((item) => item.id !== itemId),
			updatedAt: getCurrentTimestamp(),
		};

		return this.calculateTotals(updatedInvoice);
	}

	/**
	 * Update a line item in an invoice
	 */
	updateLineItem(invoice: Invoice, updatedItem: LineItem): Invoice {
		// Validate updated line item
		const itemValidation = validateLineItem(updatedItem);
		if (!itemValidation.isValid) {
			throw new Error(`Invalid line item: ${itemValidation.errors.join(", ")}`);
		}

		const itemIndex = invoice.lineItems.findIndex(
			(item) => item.id === updatedItem.id
		);

		if (itemIndex === -1) {
			throw new Error(`Line item with ID ${updatedItem.id} not found`);
		}

		const updatedInvoice = {
			...invoice,
			lineItems: invoice.lineItems.map((item) =>
				item.id === updatedItem.id
					? {
							...updatedItem,
							total: updatedItem.quantity * updatedItem.unitPrice,
					  }
					: item
			),
			updatedAt: getCurrentTimestamp(),
		};

		return this.calculateTotals(updatedInvoice);
	}

	/**
	 * Calculate and update all totals for an invoice
	 */
	calculateTotals(invoice: Invoice): Invoice {
		const lineItemsWithoutTotals = invoice.lineItems.map(
			({ total, ...item }) => item
		);
		const calculations = calculateInvoiceTotals(lineItemsWithoutTotals, 0); // No tax for now

		return {
			...invoice,
			lineItems: calculations.lineItems,
			subtotal: calculations.subtotal,
			tax: calculations.tax,
			total: calculations.total,
		};
	}

	/**
	 * Save an invoice to storage
	 */
	saveInvoice(invoice: Invoice): void {
		// Validate invoice before saving
		const validation = validateInvoice(invoice);
		if (!validation.isValid) {
			throw new Error(`Invalid invoice: ${validation.errors.join(", ")}`);
		}

		// Ensure totals are calculated correctly
		const invoiceWithCalculatedTotals = this.calculateTotals(invoice);

		this.storageService.saveInvoice(invoiceWithCalculatedTotals);
	}

	/**
	 * Update an existing invoice
	 */
	updateInvoice(invoice: Invoice): void {
		// Validate invoice before updating
		const validation = validateInvoice(invoice);
		if (!validation.isValid) {
			throw new Error(`Invalid invoice: ${validation.errors.join(", ")}`);
		}

		// Update timestamp
		const updatedInvoice = {
			...invoice,
			updatedAt: getCurrentTimestamp(),
		};

		// Ensure totals are calculated correctly
		const invoiceWithCalculatedTotals = this.calculateTotals(updatedInvoice);

		this.storageService.updateInvoice(invoiceWithCalculatedTotals);
	}

	/**
	 * Delete an invoice
	 */
	deleteInvoice(invoiceId: string): void {
		this.storageService.deleteInvoice(invoiceId);
	}

	/**
	 * Get an invoice by ID
	 */
	getInvoice(invoiceId: string): Invoice | null {
		return this.storageService.getInvoice(invoiceId);
	}

	/**
	 * Get all invoices
	 */
	getAllInvoices(): Invoice[] {
		return this.storageService.getAllInvoices();
	}

	/**
	 * Search invoices by client name, invoice number, or date
	 */
	searchInvoices(query: string): Invoice[] {
		return this.storageService.searchInvoices(query);
	}

	/**
	 * Filter invoices by status
	 */
	filterInvoicesByStatus(status: Invoice["status"]): Invoice[] {
		const allInvoices = this.getAllInvoices();
		return allInvoices.filter((invoice) => invoice.status === status);
	}

	/**
	 * Filter invoices by date range
	 */
	filterInvoicesByDateRange(startDate: number, endDate: number): Invoice[] {
		const allInvoices = this.getAllInvoices();
		return allInvoices.filter(
			(invoice) =>
				invoice.issueDate >= startDate && invoice.issueDate <= endDate
		);
	}

	/**
	 * Get invoices for a specific client
	 */
	getInvoicesForClient(clientId: string): Invoice[] {
		const allInvoices = this.getAllInvoices();
		return allInvoices.filter((invoice) => invoice.clientId === clientId);
	}

	/**
	 * Update invoice status
	 */
	updateInvoiceStatus(invoiceId: string, status: Invoice["status"]): void {
		const invoice = this.getInvoice(invoiceId);
		if (!invoice) {
			throw new Error(`Invoice with ID ${invoiceId} not found`);
		}

		const updatedInvoice = {
			...invoice,
			status,
			updatedAt: getCurrentTimestamp(),
		};

		this.storageService.updateInvoice(updatedInvoice);
	}

	/**
	 * Duplicate an existing invoice
	 */
	duplicateInvoice(invoiceId: string): Invoice {
		const originalInvoice = this.getInvoice(invoiceId);
		if (!originalInvoice) {
			throw new Error(`Invoice with ID ${invoiceId} not found`);
		}

		const now = getCurrentTimestamp();
		const newInvoiceNumber = this.storageService.getNextInvoiceNumber();

		const duplicatedInvoice: Invoice = {
			...originalInvoice,
			id: generateId(),
			invoiceNumber: newInvoiceNumber,
			status: "draft",
			issueDate: now,
			dueDate: now + 30 * 24 * 60 * 60 * 1000, // Default 30 days from now
			createdAt: now,
			updatedAt: now,
			// Generate new IDs for line items
			lineItems: originalInvoice.lineItems.map((item) => ({
				...item,
				id: generateId(),
			})),
		};

		return duplicatedInvoice;
	}

	/**
	 * Get invoice statistics
	 */
	getInvoiceStats(): {
		total: number;
		draft: number;
		issued: number;
		paid: number;
		totalAmount: number;
		paidAmount: number;
		outstandingAmount: number;
	} {
		const allInvoices = this.getAllInvoices();

		const stats = {
			total: allInvoices.length,
			draft: 0,
			issued: 0,
			paid: 0,
			totalAmount: 0,
			paidAmount: 0,
			outstandingAmount: 0,
		};

		allInvoices.forEach((invoice) => {
			stats[invoice.status]++;
			stats.totalAmount += invoice.total;

			if (invoice.status === "paid") {
				stats.paidAmount += invoice.total;
			} else if (invoice.status === "issued") {
				stats.outstandingAmount += invoice.total;
			}
		});

		// Round amounts to 2 decimal places
		stats.totalAmount = Math.round(stats.totalAmount * 100) / 100;
		stats.paidAmount = Math.round(stats.paidAmount * 100) / 100;
		stats.outstandingAmount = Math.round(stats.outstandingAmount * 100) / 100;

		return stats;
	}
}

// Export a factory function to create InvoiceManager with default StorageService
import { storageService } from "./StorageService";

export const createInvoiceManager = () => new InvoiceManager(storageService);

// Export a singleton instance
export const invoiceManager = createInvoiceManager();
