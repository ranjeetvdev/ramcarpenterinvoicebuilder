import type { Client, ClientData } from "../types";
import { validateClient } from "../types";
import { StorageService } from "./StorageService";
import { generateId, getCurrentTimestamp } from "../utils";

/**
 * ClientManager handles all business logic operations for clients
 * Provides CRUD operations, validation, and search functionality
 */
export class ClientManager {
	private storageService: StorageService;

	constructor(storageService: StorageService) {
		this.storageService = storageService;
	}

	/**
	 * Create a new client
	 */
	createClient(data: ClientData): Client {
		// Validate client data
		const validation = validateClient(data);
		if (!validation.isValid) {
			throw new Error(`Invalid client data: ${validation.errors.join(", ")}`);
		}

		// Normalize data
		const normalizedData = this.normalizeClientData(data);

		// Check for duplicate clients (same name and email if provided)
		if (this.isDuplicateClient(normalizedData)) {
			throw new Error("A client with the same name and email already exists");
		}

		const client: Client = {
			...normalizedData,
			id: generateId(),
			createdAt: getCurrentTimestamp(),
		};

		this.storageService.saveClient(client);
		return client;
	}

	/**
	 * Update an existing client
	 */
	updateClient(client: Client): void {
		// Validate client data
		const validation = validateClient(client);
		if (!validation.isValid) {
			throw new Error(`Invalid client data: ${validation.errors.join(", ")}`);
		}

		// Check if client exists
		const existingClient = this.storageService.getClient(client.id);
		if (!existingClient) {
			throw new Error(`Client with ID ${client.id} not found`);
		}

		// Normalize data
		const normalizedData = this.normalizeClientData(client);

		// Check for duplicate clients (excluding the current client)
		if (this.isDuplicateClient(normalizedData, client.id)) {
			throw new Error("A client with the same name and email already exists");
		}

		const updatedClient: Client = {
			...normalizedData,
			id: client.id,
			createdAt: existingClient.createdAt, // Preserve original creation date
		};

		this.storageService.updateClient(updatedClient);
	}

	/**
	 * Delete a client
	 */
	deleteClient(clientId: string): void {
		// Check if client has associated invoices
		const invoices = this.storageService.getAllInvoices();
		const hasInvoices = invoices.some(
			(invoice) => invoice.clientId === clientId
		);

		if (hasInvoices) {
			throw new Error(
				"Cannot delete client with existing invoices. Please delete or reassign invoices first."
			);
		}

		this.storageService.deleteClient(clientId);
	}

	/**
	 * Get a client by ID
	 */
	getClient(clientId: string): Client | null {
		return this.storageService.getClient(clientId);
	}

	/**
	 * Get all clients
	 */
	getAllClients(): Client[] {
		return this.storageService.getAllClients();
	}

	/**
	 * Search clients by name, phone, or email
	 */
	searchClients(query: string): Client[] {
		if (!query || typeof query !== "string" || query.trim().length === 0) {
			return this.getAllClients();
		}

		return this.storageService.searchClients(query);
	}

	/**
	 * Get clients sorted by name
	 */
	getClientsSortedByName(): Client[] {
		const clients = this.getAllClients();
		return clients.sort((a, b) => a.name.localeCompare(b.name));
	}

	/**
	 * Get clients sorted by creation date (newest first)
	 */
	getClientsSortedByDate(): Client[] {
		const clients = this.getAllClients();
		return clients.sort((a, b) => b.createdAt - a.createdAt);
	}

	/**
	 * Get recently created clients (last 30 days)
	 */
	getRecentClients(days: number = 30): Client[] {
		const cutoffDate = getCurrentTimestamp() - days * 24 * 60 * 60 * 1000;
		const clients = this.getAllClients();
		return clients.filter((client) => client.createdAt >= cutoffDate);
	}

	/**
	 * Get client statistics
	 */
	getClientStats(): {
		total: number;
		withEmail: number;
		withPhone: number;
		withAddress: number;
		recentlyAdded: number;
	} {
		const clients = this.getAllClients();
		const recentClients = this.getRecentClients(30);

		return {
			total: clients.length,
			withEmail: clients.filter(
				(client) => client.email && client.email.trim().length > 0
			).length,
			withPhone: clients.filter(
				(client) => client.phone && client.phone.trim().length > 0
			).length,
			withAddress: clients.filter(
				(client) => client.address && client.address.trim().length > 0
			).length,
			recentlyAdded: recentClients.length,
		};
	}

	/**
	 * Find clients with incomplete information
	 */
	getIncompleteClients(): Client[] {
		const clients = this.getAllClients();
		return clients.filter(
			(client) =>
				!client.email ||
				client.email.trim().length === 0 ||
				!client.phone ||
				client.phone.trim().length === 0 ||
				!client.address ||
				client.address.trim().length === 0
		);
	}

	/**
	 * Get clients with invoices
	 */
	getClientsWithInvoices(): Client[] {
		const clients = this.getAllClients();
		const invoices = this.storageService.getAllInvoices();
		const clientIdsWithInvoices = new Set(
			invoices.map((invoice) => invoice.clientId)
		);

		return clients.filter((client) => clientIdsWithInvoices.has(client.id));
	}

	/**
	 * Get clients without invoices
	 */
	getClientsWithoutInvoices(): Client[] {
		const clients = this.getAllClients();
		const invoices = this.storageService.getAllInvoices();
		const clientIdsWithInvoices = new Set(
			invoices.map((invoice) => invoice.clientId)
		);

		return clients.filter((client) => !clientIdsWithInvoices.has(client.id));
	}

	/**
	 * Advanced search with multiple criteria
	 */
	advancedSearch(criteria: {
		name?: string;
		email?: string;
		phone?: string;
		hasInvoices?: boolean;
		isIncomplete?: boolean;
	}): Client[] {
		let clients = this.getAllClients();

		// Filter by name
		if (criteria.name && criteria.name.trim().length > 0) {
			const nameQuery = criteria.name.toLowerCase().trim();
			clients = clients.filter((client) =>
				client.name.toLowerCase().includes(nameQuery)
			);
		}

		// Filter by email
		if (criteria.email && criteria.email.trim().length > 0) {
			const emailQuery = criteria.email.toLowerCase().trim();
			clients = clients.filter((client) =>
				client.email.toLowerCase().includes(emailQuery)
			);
		}

		// Filter by phone
		if (criteria.phone && criteria.phone.trim().length > 0) {
			const phoneQuery = criteria.phone.toLowerCase().trim();
			clients = clients.filter((client) =>
				client.phone.toLowerCase().includes(phoneQuery)
			);
		}

		// Filter by invoice status
		if (typeof criteria.hasInvoices === "boolean") {
			const invoices = this.storageService.getAllInvoices();
			const clientIdsWithInvoices = new Set(
				invoices.map((invoice) => invoice.clientId)
			);

			clients = clients.filter((client) => {
				const hasInvoices = clientIdsWithInvoices.has(client.id);
				return criteria.hasInvoices ? hasInvoices : !hasInvoices;
			});
		}

		// Filter by completeness
		if (criteria.isIncomplete) {
			clients = clients.filter(
				(client) =>
					!client.email ||
					client.email.trim().length === 0 ||
					!client.phone ||
					client.phone.trim().length === 0 ||
					!client.address ||
					client.address.trim().length === 0
			);
		}

		return clients;
	}

	/**
	 * Normalize client data (trim whitespace, handle empty strings)
	 */
	private normalizeClientData(data: Partial<ClientData>): ClientData {
		return {
			name: (data.name || "").trim(),
			address: (data.address || "").trim(),
			phone: (data.phone || "").trim(),
			email: (data.email || "").trim(),
		};
	}

	/**
	 * Check if a client with the same name and email already exists
	 */
	private isDuplicateClient(data: ClientData, excludeId?: string): boolean {
		const clients = this.getAllClients();

		return clients.some((client) => {
			// Skip the client being updated
			if (excludeId && client.id === excludeId) {
				return false;
			}

			// Check for same name and email (if email is provided)
			const sameName = client.name.toLowerCase() === data.name.toLowerCase();
			const sameEmail =
				data.email &&
				client.email &&
				client.email.toLowerCase() === data.email.toLowerCase();

			// Consider it a duplicate if same name and same email (when both have emails)
			return sameName && sameEmail;
		});
	}

	/**
	 * Validate client can be deleted (no associated invoices)
	 */
	canDeleteClient(clientId: string): { canDelete: boolean; reason?: string } {
		const invoices = this.storageService.getAllInvoices();
		const hasInvoices = invoices.some(
			(invoice) => invoice.clientId === clientId
		);

		if (hasInvoices) {
			const invoiceCount = invoices.filter(
				(invoice) => invoice.clientId === clientId
			).length;
			return {
				canDelete: false,
				reason: `Client has ${invoiceCount} associated invoice${
					invoiceCount > 1 ? "s" : ""
				}`,
			};
		}

		return { canDelete: true };
	}

	/**
	 * Get client invoice summary
	 */
	getClientInvoiceSummary(clientId: string): {
		totalInvoices: number;
		totalAmount: number;
		paidAmount: number;
		outstandingAmount: number;
		draftAmount: number;
	} {
		const invoices = this.storageService.getAllInvoices();
		const clientInvoices = invoices.filter(
			(invoice) => invoice.clientId === clientId
		);

		const summary = {
			totalInvoices: clientInvoices.length,
			totalAmount: 0,
			paidAmount: 0,
			outstandingAmount: 0,
			draftAmount: 0,
		};

		clientInvoices.forEach((invoice) => {
			summary.totalAmount += invoice.total;

			switch (invoice.status) {
				case "paid":
					summary.paidAmount += invoice.total;
					break;
				case "issued":
					summary.outstandingAmount += invoice.total;
					break;
				case "draft":
					summary.draftAmount += invoice.total;
					break;
			}
		});

		// Round amounts to 2 decimal places
		summary.totalAmount = Math.round(summary.totalAmount * 100) / 100;
		summary.paidAmount = Math.round(summary.paidAmount * 100) / 100;
		summary.outstandingAmount =
			Math.round(summary.outstandingAmount * 100) / 100;
		summary.draftAmount = Math.round(summary.draftAmount * 100) / 100;

		return summary;
	}
}

// Export a factory function to create ClientManager with default StorageService
import { storageService } from "./StorageService";

export const createClientManager = () => new ClientManager(storageService);

// Export a singleton instance
export const clientManager = createClientManager();
