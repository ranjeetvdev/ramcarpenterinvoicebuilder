import type { Client, Invoice } from "../types";

/**
 * StorageService handles all local storage operations for clients and invoices
 * Provides CRUD operations, search functionality, and error handling
 */
export class StorageService {
	private static readonly CLIENTS_KEY = "invoice_builder_clients";
	private static readonly INVOICES_KEY = "invoice_builder_invoices";
	private static readonly INVOICE_COUNTER_KEY = "invoice_builder_counter";

	// Client operations

	/**
	 * Save a client to local storage
	 */
	saveClient(client: Client): void {
		try {
			const clients = this.getAllClients();
			const existingIndex = clients.findIndex((c) => c.id === client.id);

			if (existingIndex >= 0) {
				clients[existingIndex] = client;
			} else {
				clients.push(client);
			}

			localStorage.setItem(StorageService.CLIENTS_KEY, JSON.stringify(clients));
		} catch (error) {
			if (error instanceof Error) {
				if (
					error.name === "QuotaExceededError" ||
					error.message.includes("quota")
				) {
					throw new Error(
						"Storage quota exceeded. Please clear some data or export your data to free up space."
					);
				}
				if (
					error.message.includes("not available") ||
					error.message.includes("disabled")
				) {
					throw new Error(
						"Local storage is not available. Please enable local storage in your browser settings."
					);
				}
			}
			throw new Error(
				`Failed to save client: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Get a client by ID
	 */
	getClient(id: string): Client | null {
		try {
			const clients = this.getAllClients();
			return clients.find((client) => client.id === id) || null;
		} catch (error) {
			throw new Error(
				`Failed to get client: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Get all clients from local storage
	 */
	getAllClients(): Client[] {
		try {
			const data = localStorage.getItem(StorageService.CLIENTS_KEY);
			if (!data) return [];

			const clients = JSON.parse(data);
			if (!Array.isArray(clients)) {
				throw new Error("Invalid clients data format");
			}

			return clients;
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error("Corrupted clients data in storage");
			}
			throw new Error(
				`Failed to get clients: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Update an existing client
	 */
	updateClient(client: Client): void {
		try {
			const clients = this.getAllClients();
			const index = clients.findIndex((c) => c.id === client.id);

			if (index === -1) {
				throw new Error(`Client with ID ${client.id} not found`);
			}

			clients[index] = client;
			localStorage.setItem(StorageService.CLIENTS_KEY, JSON.stringify(clients));
		} catch (error) {
			if (error instanceof Error && error.message.includes("not found")) {
				throw error;
			}
			throw new Error(
				`Failed to update client: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Delete a client by ID
	 */
	deleteClient(id: string): void {
		try {
			const clients = this.getAllClients();
			const filteredClients = clients.filter((client) => client.id !== id);

			if (clients.length === filteredClients.length) {
				throw new Error(`Client with ID ${id} not found`);
			}

			localStorage.setItem(
				StorageService.CLIENTS_KEY,
				JSON.stringify(filteredClients)
			);
		} catch (error) {
			if (error instanceof Error && error.message.includes("not found")) {
				throw error;
			}
			throw new Error(
				`Failed to delete client: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Search clients by name, phone, or email
	 */
	searchClients(query: string): Client[] {
		try {
			if (!query || typeof query !== "string") {
				return this.getAllClients();
			}

			const clients = this.getAllClients();
			const searchTerm = query.toLowerCase().trim();

			return clients.filter(
				(client) =>
					client.name.toLowerCase().includes(searchTerm) ||
					client.phone.toLowerCase().includes(searchTerm) ||
					client.email.toLowerCase().includes(searchTerm)
			);
		} catch (error) {
			throw new Error(
				`Failed to search clients: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	// Invoice operations

	/**
	 * Save an invoice to local storage
	 */
	saveInvoice(invoice: Invoice): void {
		try {
			const invoices = this.getAllInvoices();
			const existingIndex = invoices.findIndex((inv) => inv.id === invoice.id);

			if (existingIndex >= 0) {
				invoices[existingIndex] = invoice;
			} else {
				invoices.push(invoice);
			}

			localStorage.setItem(
				StorageService.INVOICES_KEY,
				JSON.stringify(invoices)
			);
		} catch (error) {
			if (error instanceof Error) {
				if (
					error.name === "QuotaExceededError" ||
					error.message.includes("quota")
				) {
					throw new Error(
						"Storage quota exceeded. Please clear some data or export your data to free up space."
					);
				}
				if (
					error.message.includes("not available") ||
					error.message.includes("disabled")
				) {
					throw new Error(
						"Local storage is not available. Please enable local storage in your browser settings."
					);
				}
			}
			throw new Error(
				`Failed to save invoice: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Get an invoice by ID
	 */
	getInvoice(id: string): Invoice | null {
		try {
			const invoices = this.getAllInvoices();
			return invoices.find((invoice) => invoice.id === id) || null;
		} catch (error) {
			throw new Error(
				`Failed to get invoice: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Get all invoices from local storage
	 */
	getAllInvoices(): Invoice[] {
		try {
			const data = localStorage.getItem(StorageService.INVOICES_KEY);
			if (!data) return [];

			const invoices = JSON.parse(data);
			if (!Array.isArray(invoices)) {
				throw new Error("Invalid invoices data format");
			}

			return invoices;
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error("Corrupted invoices data in storage");
			}
			throw new Error(
				`Failed to get invoices: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Update an existing invoice
	 */
	updateInvoice(invoice: Invoice): void {
		try {
			const invoices = this.getAllInvoices();
			const index = invoices.findIndex((inv) => inv.id === invoice.id);

			if (index === -1) {
				throw new Error(`Invoice with ID ${invoice.id} not found`);
			}

			invoices[index] = invoice;
			localStorage.setItem(
				StorageService.INVOICES_KEY,
				JSON.stringify(invoices)
			);
		} catch (error) {
			if (error instanceof Error && error.message.includes("not found")) {
				throw error;
			}
			throw new Error(
				`Failed to update invoice: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Delete an invoice by ID
	 */
	deleteInvoice(id: string): void {
		try {
			const invoices = this.getAllInvoices();
			const filteredInvoices = invoices.filter((invoice) => invoice.id !== id);

			if (invoices.length === filteredInvoices.length) {
				throw new Error(`Invoice with ID ${id} not found`);
			}

			localStorage.setItem(
				StorageService.INVOICES_KEY,
				JSON.stringify(filteredInvoices)
			);
		} catch (error) {
			if (error instanceof Error && error.message.includes("not found")) {
				throw error;
			}
			throw new Error(
				`Failed to delete invoice: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Search invoices by client name, invoice number, or date range
	 */
	searchInvoices(query: string): Invoice[] {
		try {
			if (!query || typeof query !== "string") {
				return this.getAllInvoices();
			}

			const invoices = this.getAllInvoices();
			const searchTerm = query.toLowerCase().trim();

			return invoices.filter(
				(invoice) =>
					invoice.client.name.toLowerCase().includes(searchTerm) ||
					invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
					new Date(invoice.issueDate)
						.toLocaleDateString()
						.includes(searchTerm) ||
					new Date(invoice.dueDate).toLocaleDateString().includes(searchTerm)
			);
		} catch (error) {
			throw new Error(
				`Failed to search invoices: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Generate the next sequential invoice number
	 */
	getNextInvoiceNumber(): string {
		try {
			const counterData = localStorage.getItem(
				StorageService.INVOICE_COUNTER_KEY
			);
			let counter = 1;

			if (counterData) {
				const parsed = parseInt(counterData, 10);
				if (!isNaN(parsed)) {
					counter = parsed + 1;
				}
			}

			// Save the updated counter
			localStorage.setItem(
				StorageService.INVOICE_COUNTER_KEY,
				counter.toString()
			);

			// Format as INV-001, INV-002, etc.
			return `INV-${counter.toString().padStart(3, "0")}`;
		} catch (error) {
			throw new Error(
				`Failed to generate invoice number: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	// Utility methods

	/**
	 * Clear all data from local storage
	 */
	clearAll(): void {
		try {
			localStorage.removeItem(StorageService.CLIENTS_KEY);
			localStorage.removeItem(StorageService.INVOICES_KEY);
			localStorage.removeItem(StorageService.INVOICE_COUNTER_KEY);
		} catch (error) {
			throw new Error(
				`Failed to clear storage: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Export all data as JSON string
	 */
	exportData(): string {
		try {
			const data = {
				clients: this.getAllClients(),
				invoices: this.getAllInvoices(),
				counter:
					localStorage.getItem(StorageService.INVOICE_COUNTER_KEY) || "0",
			};

			return JSON.stringify(data, null, 2);
		} catch (error) {
			throw new Error(
				`Failed to export data: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Import data from JSON string
	 */
	importData(data: string): void {
		try {
			const parsed = JSON.parse(data);

			if (!parsed || typeof parsed !== "object") {
				throw new Error("Invalid data format");
			}

			// Validate structure
			if (parsed.clients && Array.isArray(parsed.clients)) {
				localStorage.setItem(
					StorageService.CLIENTS_KEY,
					JSON.stringify(parsed.clients)
				);
			}

			if (parsed.invoices && Array.isArray(parsed.invoices)) {
				localStorage.setItem(
					StorageService.INVOICES_KEY,
					JSON.stringify(parsed.invoices)
				);
			}

			if (parsed.counter && typeof parsed.counter === "string") {
				localStorage.setItem(
					StorageService.INVOICE_COUNTER_KEY,
					parsed.counter
				);
			}
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error("Invalid JSON format");
			}
			throw new Error(
				`Failed to import data: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	/**
	 * Check if local storage is available and working
	 */
	isStorageAvailable(): boolean {
		try {
			const testKey = "__storage_test__";
			localStorage.setItem(testKey, "test");
			localStorage.removeItem(testKey);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get storage usage information
	 */
	getStorageInfo(): { used: number; available: boolean } {
		try {
			const data = this.exportData();
			return {
				used: new Blob([data]).size,
				available: this.isStorageAvailable(),
			};
		} catch {
			return {
				used: 0,
				available: false,
			};
		}
	}
}

// Export a singleton instance
export const storageService = new StorageService();
