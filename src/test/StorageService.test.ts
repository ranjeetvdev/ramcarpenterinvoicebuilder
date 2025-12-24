import { describe, it, expect, beforeEach, vi } from "vitest";
import { StorageService } from "../services/StorageService";
import type { Client, Invoice } from "../types";
import { generateId, getCurrentTimestamp } from "../utils";

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

describe("StorageService", () => {
	let storageService: StorageService;
	let mockClient: Client;
	let mockInvoice: Invoice;

	beforeEach(() => {
		// Clear localStorage before each test
		localStorageMock.clear();
		storageService = new StorageService();

		// Create mock data
		mockClient = {
			id: generateId(),
			name: "John Doe",
			address: "123 Main St",
			phone: "555-1234",
			email: "john@example.com",
			createdAt: getCurrentTimestamp(),
		};

		mockInvoice = {
			id: generateId(),
			invoiceNumber: "INV-001",
			clientId: mockClient.id,
			client: mockClient,
			lineItems: [
				{
					id: generateId(),
					description: "Test Service",
					quantity: 2,
					unitPrice: 100,
					total: 200,
				},
			],
			subtotal: 200,
			tax: 20,
			total: 220,
			issueDate: getCurrentTimestamp(),
			dueDate: getCurrentTimestamp() + 86400000, // +1 day
			notes: "Test notes",
			status: "draft",
			createdAt: getCurrentTimestamp(),
			updatedAt: getCurrentTimestamp(),
		};
	});

	describe("Client Operations", () => {
		it("should save and retrieve a client", () => {
			storageService.saveClient(mockClient);
			const retrieved = storageService.getClient(mockClient.id);
			expect(retrieved).toEqual(mockClient);
		});

		it("should return null for non-existent client", () => {
			const result = storageService.getClient("non-existent-id");
			expect(result).toBeNull();
		});

		it("should get all clients", () => {
			const client2 = { ...mockClient, id: generateId(), name: "Jane Doe" };

			storageService.saveClient(mockClient);
			storageService.saveClient(client2);

			const allClients = storageService.getAllClients();
			expect(allClients).toHaveLength(2);
			expect(allClients).toContainEqual(mockClient);
			expect(allClients).toContainEqual(client2);
		});

		it("should update an existing client", () => {
			storageService.saveClient(mockClient);

			const updatedClient = { ...mockClient, name: "John Updated" };
			storageService.updateClient(updatedClient);

			const retrieved = storageService.getClient(mockClient.id);
			expect(retrieved?.name).toBe("John Updated");
		});

		it("should throw error when updating non-existent client", () => {
			expect(() => {
				storageService.updateClient(mockClient);
			}).toThrow("Client with ID");
		});

		it("should delete a client", () => {
			storageService.saveClient(mockClient);
			expect(storageService.getClient(mockClient.id)).not.toBeNull();

			storageService.deleteClient(mockClient.id);
			expect(storageService.getClient(mockClient.id)).toBeNull();
		});

		it("should throw error when deleting non-existent client", () => {
			expect(() => {
				storageService.deleteClient("non-existent-id");
			}).toThrow("Client with ID");
		});

		it("should search clients by name", () => {
			const client2 = { ...mockClient, id: generateId(), name: "Jane Smith" };
			storageService.saveClient(mockClient);
			storageService.saveClient(client2);

			const results = storageService.searchClients("Doe");
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe("John Doe");
		});

		it("should search clients by phone", () => {
			storageService.saveClient(mockClient);

			const results = storageService.searchClients("555");
			expect(results).toHaveLength(1);
			expect(results[0].phone).toBe("555-1234");
		});

		it("should search clients by email", () => {
			storageService.saveClient(mockClient);

			const results = storageService.searchClients("john@example");
			expect(results).toHaveLength(1);
			expect(results[0].email).toBe("john@example.com");
		});

		it("should return all clients for empty search query", () => {
			storageService.saveClient(mockClient);

			const results = storageService.searchClients("");
			expect(results).toHaveLength(1);
		});
	});

	describe("Invoice Operations", () => {
		it("should save and retrieve an invoice", () => {
			storageService.saveInvoice(mockInvoice);
			const retrieved = storageService.getInvoice(mockInvoice.id);
			expect(retrieved).toEqual(mockInvoice);
		});

		it("should return null for non-existent invoice", () => {
			const result = storageService.getInvoice("non-existent-id");
			expect(result).toBeNull();
		});

		it("should get all invoices", () => {
			const invoice2 = {
				...mockInvoice,
				id: generateId(),
				invoiceNumber: "INV-002",
			};

			storageService.saveInvoice(mockInvoice);
			storageService.saveInvoice(invoice2);

			const allInvoices = storageService.getAllInvoices();
			expect(allInvoices).toHaveLength(2);
			expect(allInvoices).toContainEqual(mockInvoice);
			expect(allInvoices).toContainEqual(invoice2);
		});

		it("should update an existing invoice", () => {
			storageService.saveInvoice(mockInvoice);

			const updatedInvoice = { ...mockInvoice, notes: "Updated notes" };
			storageService.updateInvoice(updatedInvoice);

			const retrieved = storageService.getInvoice(mockInvoice.id);
			expect(retrieved?.notes).toBe("Updated notes");
		});

		it("should throw error when updating non-existent invoice", () => {
			expect(() => {
				storageService.updateInvoice(mockInvoice);
			}).toThrow("Invoice with ID");
		});

		it("should delete an invoice", () => {
			storageService.saveInvoice(mockInvoice);
			expect(storageService.getInvoice(mockInvoice.id)).not.toBeNull();

			storageService.deleteInvoice(mockInvoice.id);
			expect(storageService.getInvoice(mockInvoice.id)).toBeNull();
		});

		it("should throw error when deleting non-existent invoice", () => {
			expect(() => {
				storageService.deleteInvoice("non-existent-id");
			}).toThrow("Invoice with ID");
		});

		it("should search invoices by client name", () => {
			storageService.saveInvoice(mockInvoice);

			const results = storageService.searchInvoices("john");
			expect(results).toHaveLength(1);
			expect(results[0].client.name).toBe("John Doe");
		});

		it("should search invoices by invoice number", () => {
			storageService.saveInvoice(mockInvoice);

			const results = storageService.searchInvoices("INV-001");
			expect(results).toHaveLength(1);
			expect(results[0].invoiceNumber).toBe("INV-001");
		});

		it("should return all invoices for empty search query", () => {
			storageService.saveInvoice(mockInvoice);

			const results = storageService.searchInvoices("");
			expect(results).toHaveLength(1);
		});
	});

	describe("Invoice Number Generation", () => {
		it("should generate sequential invoice numbers", () => {
			const first = storageService.getNextInvoiceNumber();
			const second = storageService.getNextInvoiceNumber();
			const third = storageService.getNextInvoiceNumber();

			expect(first).toBe("INV-001");
			expect(second).toBe("INV-002");
			expect(third).toBe("INV-003");
		});

		it("should handle existing counter in storage", () => {
			// Manually set counter to 5
			localStorageMock.setItem("invoice_builder_counter", "5");

			const next = storageService.getNextInvoiceNumber();
			expect(next).toBe("INV-006");
		});

		it("should handle invalid counter data", () => {
			// Set invalid counter data
			localStorageMock.setItem("invoice_builder_counter", "invalid");

			const next = storageService.getNextInvoiceNumber();
			expect(next).toBe("INV-001");
		});
	});

	describe("Utility Methods", () => {
		it("should clear all data", () => {
			storageService.saveClient(mockClient);
			storageService.saveInvoice(mockInvoice);

			expect(storageService.getAllClients()).toHaveLength(1);
			expect(storageService.getAllInvoices()).toHaveLength(1);

			storageService.clearAll();

			expect(storageService.getAllClients()).toHaveLength(0);
			expect(storageService.getAllInvoices()).toHaveLength(0);
		});

		it("should export data as JSON", () => {
			storageService.saveClient(mockClient);
			storageService.saveInvoice(mockInvoice);

			const exported = storageService.exportData();
			const parsed = JSON.parse(exported);

			expect(parsed.clients).toHaveLength(1);
			expect(parsed.invoices).toHaveLength(1);
			expect(parsed.counter).toBeDefined();
		});

		it("should import data from JSON", () => {
			const data = {
				clients: [mockClient],
				invoices: [mockInvoice],
				counter: "5",
			};

			storageService.importData(JSON.stringify(data));

			expect(storageService.getAllClients()).toHaveLength(1);
			expect(storageService.getAllInvoices()).toHaveLength(1);
			expect(storageService.getClient(mockClient.id)).toEqual(mockClient);
		});

		it("should handle invalid import data", () => {
			expect(() => {
				storageService.importData("invalid json");
			}).toThrow("Invalid JSON format");
		});

		it("should check storage availability", () => {
			const isAvailable = storageService.isStorageAvailable();
			expect(isAvailable).toBe(true);
		});

		it("should get storage info", () => {
			storageService.saveClient(mockClient);

			const info = storageService.getStorageInfo();
			expect(info.available).toBe(true);
			expect(info.used).toBeGreaterThan(0);
		});
	});

	describe("Error Handling", () => {
		it("should handle localStorage errors gracefully", () => {
			// Mock localStorage to throw an error
			const originalSetItem = localStorageMock.setItem;
			localStorageMock.setItem = vi.fn(() => {
				throw new Error("Storage quota exceeded");
			});

			expect(() => {
				storageService.saveClient(mockClient);
			}).toThrow(
				"Storage quota exceeded. Please clear some data or export your data to free up space."
			);

			// Restore original method
			localStorageMock.setItem = originalSetItem;
		});

		it("should handle corrupted data in storage", () => {
			// Set invalid JSON data
			localStorageMock.setItem("invoice_builder_clients", "invalid json");

			expect(() => {
				storageService.getAllClients();
			}).toThrow("Corrupted clients data in storage");
		});

		it("should handle invalid data structure", () => {
			// Set valid JSON but invalid structure
			localStorageMock.setItem("invoice_builder_clients", '"not an array"');

			expect(() => {
				storageService.getAllClients();
			}).toThrow("Invalid clients data format");
		});
	});
});
