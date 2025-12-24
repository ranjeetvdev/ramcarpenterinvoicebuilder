import { useState, useEffect, useCallback, useMemo } from "react";
import type { Invoice, LineItem } from "../types";
import { InvoiceManager } from "../services/InvoiceManager";
import { storageService } from "../services/StorageService";
import { useToast } from "../contexts/ToastContext";

/**
 * Custom hook for invoice state management
 * Provides invoice CRUD operations and integrates with InvoiceManager and StorageService
 * Requirements: 1.3, 1.4, 3.2, 3.5
 */
export function useInvoices() {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const { showSuccess, showError } = useToast();

	// Create InvoiceManager instance (memoized to prevent recreation)
	const invoiceManager = useMemo(() => new InvoiceManager(storageService), []);

	// Load invoices from storage on mount
	useEffect(() => {
		const loadInvoices = async () => {
			try {
				setLoading(true);
				setError(null);
				const allInvoices = invoiceManager.getAllInvoices();
				setInvoices(allInvoices);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error loading invoices";
				setError(new Error(errorMessage));
				console.error("Error loading invoices:", err);
			} finally {
				setLoading(false);
			}
		};

		loadInvoices();
	}, []);

	// Create a new invoice
	const createInvoice = useCallback(
		(clientId: string): Invoice => {
			try {
				setError(null);
				const newInvoice = invoiceManager.createInvoice(clientId);
				return newInvoice;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error creating invoice";
				const error = new Error(errorMessage);
				setError(error);
				throw error;
			}
		},
		[invoiceManager]
	);

	// Save an invoice (create or update)
	const saveInvoice = useCallback(
		async (invoice: Invoice): Promise<void> => {
			try {
				setError(null);
				const existingInvoice = invoices.find((inv) => inv.id === invoice.id);

				if (existingInvoice) {
					invoiceManager.updateInvoice(invoice);
					setInvoices((prev) =>
						prev.map((inv) => (inv.id === invoice.id ? invoice : inv))
					);
					showSuccess(`Invoice ${invoice.invoiceNumber} updated successfully`);
				} else {
					invoiceManager.saveInvoice(invoice);
					setInvoices((prev) => [...prev, invoice]);
					showSuccess(`Invoice ${invoice.invoiceNumber} created successfully`);
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error saving invoice";
				const error = new Error(errorMessage);
				setError(error);
				showError(`Failed to save invoice: ${errorMessage}`);
				throw error;
			}
		},
		[invoiceManager, invoices, showSuccess, showError]
	);

	// Update an existing invoice
	const updateInvoice = useCallback(
		async (invoice: Invoice): Promise<void> => {
			try {
				setError(null);
				invoiceManager.updateInvoice(invoice);
				setInvoices((prev) =>
					prev.map((inv) => (inv.id === invoice.id ? invoice : inv))
				);
				showSuccess(`Invoice ${invoice.invoiceNumber} updated successfully`);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error updating invoice";
				const error = new Error(errorMessage);
				setError(error);
				showError(`Failed to update invoice: ${errorMessage}`);
				throw error;
			}
		},
		[invoiceManager, showSuccess, showError]
	);

	// Delete an invoice
	const deleteInvoice = useCallback(
		async (invoiceId: string): Promise<void> => {
			try {
				setError(null);
				const invoiceToDelete = invoices.find((inv) => inv.id === invoiceId);
				invoiceManager.deleteInvoice(invoiceId);
				setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
				showSuccess(
					`Invoice ${
						invoiceToDelete?.invoiceNumber || "Unknown"
					} deleted successfully`
				);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error deleting invoice";
				const error = new Error(errorMessage);
				setError(error);
				showError(`Failed to delete invoice: ${errorMessage}`);
				throw error;
			}
		},
		[invoiceManager, invoices, showSuccess, showError]
	);

	// Get an invoice by ID
	const getInvoice = useCallback(
		(invoiceId: string): Invoice | null => {
			return invoices.find((invoice) => invoice.id === invoiceId) || null;
		},
		[invoices]
	);

	// Add line item to invoice
	const addLineItem = useCallback(
		(invoice: Invoice, item: Omit<LineItem, "id" | "total">): Invoice => {
			try {
				setError(null);
				return invoiceManager.addLineItem(invoice, item);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error adding line item";
				setError(new Error(errorMessage));
				throw err;
			}
		},
		[invoiceManager]
	);

	// Remove line item from invoice
	const removeLineItem = useCallback(
		(invoice: Invoice, itemId: string): Invoice => {
			try {
				setError(null);
				return invoiceManager.removeLineItem(invoice, itemId);
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Unknown error removing line item";
				setError(new Error(errorMessage));
				throw err;
			}
		},
		[invoiceManager]
	);

	// Update line item in invoice
	const updateLineItem = useCallback(
		(invoice: Invoice, updatedItem: LineItem): Invoice => {
			try {
				setError(null);
				return invoiceManager.updateLineItem(invoice, updatedItem);
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Unknown error updating line item";
				setError(new Error(errorMessage));
				throw err;
			}
		},
		[invoiceManager]
	);

	// Calculate totals for invoice
	const calculateTotals = useCallback(
		(invoice: Invoice): Invoice => {
			return invoiceManager.calculateTotals(invoice);
		},
		[invoiceManager]
	);

	// Search invoices
	const searchInvoices = useCallback(
		(query: string): Invoice[] => {
			try {
				setError(null);
				return invoiceManager.searchInvoices(query);
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Unknown error searching invoices";
				setError(new Error(errorMessage));
				return [];
			}
		},
		[invoiceManager]
	);

	// Filter invoices by status
	const filterInvoicesByStatus = useCallback(
		(status: Invoice["status"]): Invoice[] => {
			return invoiceManager.filterInvoicesByStatus(status);
		},
		[invoiceManager]
	);

	// Filter invoices by date range
	const filterInvoicesByDateRange = useCallback(
		(startDate: number, endDate: number): Invoice[] => {
			return invoiceManager.filterInvoicesByDateRange(startDate, endDate);
		},
		[invoiceManager]
	);

	// Get invoices for a specific client
	const getInvoicesForClient = useCallback(
		(clientId: string): Invoice[] => {
			return invoiceManager.getInvoicesForClient(clientId);
		},
		[invoiceManager]
	);

	// Update invoice status
	const updateInvoiceStatus = useCallback(
		async (invoiceId: string, status: Invoice["status"]): Promise<void> => {
			try {
				setError(null);
				const invoice = invoices.find((inv) => inv.id === invoiceId);
				invoiceManager.updateInvoiceStatus(invoiceId, status);
				setInvoices((prev) =>
					prev.map((inv) =>
						inv.id === invoiceId
							? { ...inv, status, updatedAt: Date.now() }
							: inv
					)
				);
				showSuccess(
					`Invoice ${
						invoice?.invoiceNumber || "Unknown"
					} status updated to ${status}`
				);
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Unknown error updating invoice status";
				const error = new Error(errorMessage);
				setError(error);
				showError(`Failed to update invoice status: ${errorMessage}`);
				throw error;
			}
		},
		[invoiceManager, invoices, showSuccess, showError]
	);

	// Duplicate an invoice
	const duplicateInvoice = useCallback(
		(invoiceId: string): Invoice => {
			try {
				setError(null);
				return invoiceManager.duplicateInvoice(invoiceId);
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Unknown error duplicating invoice";
				setError(new Error(errorMessage));
				throw err;
			}
		},
		[invoiceManager]
	);

	// Get invoice statistics
	const getInvoiceStats = useCallback(() => {
		return invoiceManager.getInvoiceStats();
	}, [invoiceManager]);

	// Get draft invoices
	const getDraftInvoices = useCallback((): Invoice[] => {
		return filterInvoicesByStatus("draft");
	}, [filterInvoicesByStatus]);

	// Get issued invoices
	const getIssuedInvoices = useCallback((): Invoice[] => {
		return filterInvoicesByStatus("issued");
	}, [filterInvoicesByStatus]);

	// Get paid invoices
	const getPaidInvoices = useCallback((): Invoice[] => {
		return filterInvoicesByStatus("paid");
	}, [filterInvoicesByStatus]);

	// Get overdue invoices (issued invoices past due date)
	const getOverdueInvoices = useCallback((): Invoice[] => {
		const now = Date.now();
		return invoices.filter(
			(invoice) => invoice.status === "issued" && invoice.dueDate < now
		);
	}, [invoices]);

	// Get recent invoices
	const getRecentInvoices = useCallback(
		(days: number = 30): Invoice[] => {
			const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
			return invoices.filter((invoice) => invoice.createdAt >= cutoffDate);
		},
		[invoices]
	);

	// Refresh invoices from storage
	const refreshInvoices = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const allInvoices = invoiceManager.getAllInvoices();
			setInvoices(allInvoices);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Unknown error refreshing invoices";
			setError(new Error(errorMessage));
		} finally {
			setLoading(false);
		}
	}, [invoiceManager]);

	return {
		// State
		invoices,
		loading,
		error,

		// CRUD operations
		createInvoice,
		saveInvoice,
		updateInvoice,
		deleteInvoice,
		getInvoice,

		// Line item operations
		addLineItem,
		removeLineItem,
		updateLineItem,
		calculateTotals,

		// Search and filtering
		searchInvoices,
		filterInvoicesByStatus,
		filterInvoicesByDateRange,
		getInvoicesForClient,

		// Status management
		updateInvoiceStatus,
		getDraftInvoices,
		getIssuedInvoices,
		getPaidInvoices,
		getOverdueInvoices,

		// Utility functions
		duplicateInvoice,
		getInvoiceStats,
		getRecentInvoices,
		refreshInvoices,
	};
}
