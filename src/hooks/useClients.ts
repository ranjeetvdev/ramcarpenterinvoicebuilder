import { useState, useEffect, useCallback, useMemo } from "react";
import type { Client, ClientData } from "../types";
import { ClientManager } from "../services/ClientManager";
import { storageService } from "../services/StorageService";
import { useToast } from "../contexts/ToastContext";

/**
 * Custom hook for client state management
 * Provides client CRUD operations and integrates with ClientManager and StorageService
 * Requirements: 2.1, 2.2, 2.4
 */
export function useClients() {
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const { showSuccess, showError } = useToast();

	// Create ClientManager instance (memoized to prevent recreation)
	const clientManager = useMemo(() => new ClientManager(storageService), []);

	// Load clients from storage on mount
	useEffect(() => {
		const loadClients = async () => {
			try {
				setLoading(true);
				setError(null);
				const allClients = clientManager.getAllClients();
				setClients(allClients);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error loading clients";
				setError(new Error(errorMessage));
				console.error("Error loading clients:", err);
			} finally {
				setLoading(false);
			}
		};

		loadClients();
	}, []);

	// Create a new client
	const createClient = useCallback(
		async (clientData: ClientData): Promise<Client> => {
			try {
				setError(null);
				const newClient = clientManager.createClient(clientData);
				setClients((prev) => [...prev, newClient]);
				showSuccess(`Client "${newClient.name}" created successfully`);
				return newClient;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error creating client";
				const error = new Error(errorMessage);
				setError(error);
				showError(`Failed to create client: ${errorMessage}`);
				throw error;
			}
		},
		[clientManager, showSuccess, showError]
	);

	// Update an existing client
	const updateClient = useCallback(
		async (client: Client): Promise<void> => {
			try {
				setError(null);
				clientManager.updateClient(client);
				setClients((prev) =>
					prev.map((c) => (c.id === client.id ? client : c))
				);
				showSuccess(`Client "${client.name}" updated successfully`);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error updating client";
				const error = new Error(errorMessage);
				setError(error);
				showError(`Failed to update client: ${errorMessage}`);
				throw error;
			}
		},
		[clientManager, showSuccess, showError]
	);

	// Delete a client
	const deleteClient = useCallback(
		async (clientId: string): Promise<void> => {
			try {
				setError(null);
				const clientToDelete = clients.find((c) => c.id === clientId);
				clientManager.deleteClient(clientId);
				setClients((prev) => prev.filter((c) => c.id !== clientId));
				showSuccess(
					`Client "${clientToDelete?.name || "Unknown"}" deleted successfully`
				);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error deleting client";
				const error = new Error(errorMessage);
				setError(error);
				showError(`Failed to delete client: ${errorMessage}`);
				throw error;
			}
		},
		[clientManager, clients, showSuccess, showError]
	);

	// Get a client by ID
	const getClient = useCallback(
		(clientId: string): Client | null => {
			return clients.find((client) => client.id === clientId) || null;
		},
		[clients]
	);

	// Search clients
	const searchClients = useCallback(
		(query: string): Client[] => {
			try {
				setError(null);
				return clientManager.searchClients(query);
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Unknown error searching clients";
				setError(new Error(errorMessage));
				return [];
			}
		},
		[clientManager]
	);

	// Get clients sorted by name
	const getClientsSortedByName = useCallback((): Client[] => {
		return clientManager.getClientsSortedByName();
	}, [clientManager]);

	// Get clients sorted by creation date
	const getClientsSortedByDate = useCallback((): Client[] => {
		return clientManager.getClientsSortedByDate();
	}, [clientManager]);

	// Get recent clients
	const getRecentClients = useCallback(
		(days: number = 30): Client[] => {
			return clientManager.getRecentClients(days);
		},
		[clientManager]
	);

	// Get client statistics
	const getClientStats = useCallback(() => {
		return clientManager.getClientStats();
	}, [clientManager]);

	// Get incomplete clients
	const getIncompleteClients = useCallback((): Client[] => {
		return clientManager.getIncompleteClients();
	}, [clientManager]);

	// Get clients with invoices
	const getClientsWithInvoices = useCallback((): Client[] => {
		return clientManager.getClientsWithInvoices();
	}, [clientManager]);

	// Get clients without invoices
	const getClientsWithoutInvoices = useCallback((): Client[] => {
		return clientManager.getClientsWithoutInvoices();
	}, [clientManager]);

	// Advanced search
	const advancedSearch = useCallback(
		(criteria: {
			name?: string;
			email?: string;
			phone?: string;
			hasInvoices?: boolean;
			isIncomplete?: boolean;
		}): Client[] => {
			try {
				setError(null);
				return clientManager.advancedSearch(criteria);
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Unknown error in advanced search";
				setError(new Error(errorMessage));
				return [];
			}
		},
		[clientManager]
	);

	// Check if client can be deleted
	const canDeleteClient = useCallback(
		(clientId: string): { canDelete: boolean; reason?: string } => {
			return clientManager.canDeleteClient(clientId);
		},
		[clientManager]
	);

	// Get client invoice summary
	const getClientInvoiceSummary = useCallback(
		(clientId: string) => {
			return clientManager.getClientInvoiceSummary(clientId);
		},
		[clientManager]
	);

	// Refresh clients from storage
	const refreshClients = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const allClients = clientManager.getAllClients();
			setClients(allClients);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error refreshing clients";
			setError(new Error(errorMessage));
		} finally {
			setLoading(false);
		}
	}, [clientManager]);

	return {
		// State
		clients,
		loading,
		error,

		// CRUD operations
		createClient,
		updateClient,
		deleteClient,
		getClient,

		// Search and filtering
		searchClients,
		getClientsSortedByName,
		getClientsSortedByDate,
		getRecentClients,
		getIncompleteClients,
		getClientsWithInvoices,
		getClientsWithoutInvoices,
		advancedSearch,

		// Utility functions
		getClientStats,
		canDeleteClient,
		getClientInvoiceSummary,
		refreshClients,
	};
}
