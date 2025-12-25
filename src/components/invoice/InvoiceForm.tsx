import React, { useState, useEffect, useCallback } from "react";
import type { Invoice, Client, LineItem } from "../../types";
import { validateInvoice } from "../../types";
import { useClients } from "../../hooks/useClients";
import { Button, Input } from "../common";
import { ClientSelector } from "../client";
import { LineItemForm, LineItemList } from "./";

export interface InvoiceFormProps {
	invoice?: Invoice | null;
	onSubmit: (invoice: Invoice) => Promise<void>;
	onCancel: () => void;
	loading?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = React.memo(
	({ invoice, onSubmit, onCancel, loading = false }) => {
		const { clients } = useClients();

		const [formData, setFormData] = useState<Partial<Invoice>>({
			clientId: "",
			client: undefined,
			lineItems: [],
			subtotal: 0,
			tax: 0,
			total: 0,
			issueDate: Date.now(),
			notes: "",
			status: "issued",
		});

		const [errors, setErrors] = useState<Record<string, string>>({});
		const [isSubmitting, setIsSubmitting] = useState(false);

		// Initialize form data when invoice prop changes
		useEffect(() => {
			if (invoice) {
				const { dueDate, stamp, ...invoiceWithoutUnwantedFields } = invoice;
				setFormData({
					...invoiceWithoutUnwantedFields,
					issueDate: invoice.issueDate,
				});
			} else {
				const now = Date.now();
				setFormData({
					clientId: "",
					client: undefined,
					lineItems: [],
					subtotal: 0,
					tax: 0,
					total: 0,
					issueDate: now,
					notes: "",
					status: "issued",
				});
			}
			setErrors({});
		}, [invoice]);

		// Calculate totals whenever line items change
		const calculateTotals = useCallback((lineItems: LineItem[]) => {
			const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
			const tax = 0; // No tax calculation
			const total = subtotal; // Total is just subtotal since no tax

			return {
				subtotal: Math.round(subtotal * 100) / 100,
				tax: Math.round(tax * 100) / 100,
				total: Math.round(total * 100) / 100,
			};
		}, []);

		// Update totals when line items change
		useEffect(() => {
			if (formData.lineItems) {
				const totals = calculateTotals(formData.lineItems);
				setFormData((prev) => ({
					...prev,
					...totals,
				}));
			}
		}, [formData.lineItems, calculateTotals]);

		const handleClientSelect = useCallback(
			(client: Client) => {
				setFormData((prev) => ({
					...prev,
					clientId: client.id,
					client: { ...client },
				}));

				// Clear client-related errors
				if (errors.clientId) {
					setErrors((prev) => ({
						...prev,
						clientId: "",
					}));
				}
			},
			[errors.clientId]
		);

		const handleInputChange = useCallback(
			(field: keyof Invoice, value: any) => {
				setFormData((prev) => ({
					...prev,
					[field]: value,
				}));

				// Clear error for this field when user starts typing
				if (errors[field]) {
					setErrors((prev) => ({
						...prev,
						[field]: "",
					}));
				}
			},
			[errors]
		);

		const handleDateChange = useCallback(
			(field: "issueDate", value: string) => {
				const timestamp = new Date(value).getTime();
				handleInputChange(field, timestamp);
			},
			[handleInputChange]
		);

		const handleAddLineItem = useCallback((lineItem: Omit<LineItem, "id">) => {
			const newLineItem: LineItem = {
				...lineItem,
				id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			};

			setFormData((prev) => ({
				...prev,
				lineItems: [...(prev.lineItems || []), newLineItem],
			}));
		}, []);

		const handleUpdateLineItem = useCallback((updatedItem: LineItem) => {
			setFormData((prev) => ({
				...prev,
				lineItems: (prev.lineItems || []).map((item) =>
					item.id === updatedItem.id ? updatedItem : item
				),
			}));
		}, []);

		const handleRemoveLineItem = useCallback((itemId: string) => {
			setFormData((prev) => ({
				...prev,
				lineItems: (prev.lineItems || []).filter((item) => item.id !== itemId),
			}));
		}, []);

		const handleSubmit = async (e: React.FormEvent) => {
			e.preventDefault();

			// Create invoice data without unwanted fields
			const invoiceData = {
				...formData,
				id:
					invoice?.id ||
					`inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				invoiceNumber:
					invoice?.invoiceNumber || `INV-${String(Date.now()).slice(-6)}`,
				createdAt: invoice?.createdAt || Date.now(),
				updatedAt: Date.now(),
				status: "issued", // Always set to issued
			} as Invoice;

			// Remove unwanted fields
			delete (invoiceData as any).dueDate;
			delete (invoiceData as any).stamp;

			const validation = validateInvoice(invoiceData);
			if (!validation.isValid) {
				const fieldErrors: Record<string, string> = {};
				validation.errors.forEach((error) => {
					if (error.toLowerCase().includes("client")) {
						fieldErrors.clientId = error;
					} else if (error.toLowerCase().includes("line item")) {
						fieldErrors.lineItems = error;
					} else if (error.toLowerCase().includes("issue date")) {
						fieldErrors.issueDate = error;
					} else {
						fieldErrors.general = error;
					}
				});
				setErrors(fieldErrors);
				return;
			}

			try {
				setIsSubmitting(true);
				setErrors({});
				await onSubmit(invoiceData);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "An error occurred";
				setErrors({ general: errorMessage });
			} finally {
				setIsSubmitting(false);
			}
		};

		const isFormDisabled = loading || isSubmitting;

		// Format date for input (memoized)
		const formatDateForInput = useCallback((timestamp: number) => {
			return new Date(timestamp).toISOString().split("T")[0];
		}, []);

		return (
			<form onSubmit={handleSubmit} className="space-y-8">
				{errors.general && (
					<div
						className="rounded-md bg-red-50 p-4"
						role="alert"
						aria-live="polite"
					>
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-red-800">
									{errors.general}
								</h3>
							</div>
						</div>
					</div>
				)}

				{/* Client Selection */}
				<div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-100">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Client Information
					</h3>
					<ClientSelector
						clients={clients}
						selectedClientId={formData.clientId}
						onSelect={handleClientSelect}
						error={errors.clientId}
						disabled={isFormDisabled}
					/>
				</div>

				{/* Invoice Details */}
				<div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-100">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Invoice Details
					</h3>
					<div className="grid grid-cols-1 gap-4 sm:gap-6">
						<div>
							<Input
								label="Issue Date"
								type="date"
								value={formatDateForInput(formData.issueDate || Date.now())}
								onChange={(e) => handleDateChange("issueDate", e.target.value)}
								error={errors.issueDate}
								disabled={isFormDisabled}
								required
							/>
						</div>
					</div>

					<div className="mt-6">
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Notes
						</label>
						<textarea
							value={formData.notes || ""}
							onChange={(e) => handleInputChange("notes", e.target.value)}
							rows={4}
							className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 ease-in-out resize-none"
							placeholder="Additional notes or payment terms..."
							disabled={isFormDisabled}
						/>
					</div>
				</div>

				{/* Line Items */}
				<div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-100">
					<h3 className="text-lg font-medium text-gray-900 mb-4">Line Items</h3>

					{errors.lineItems && (
						<div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
							<p className="text-sm text-red-600">{errors.lineItems}</p>
						</div>
					)}

					<LineItemForm
						onAdd={handleAddLineItem}
						submitLabel="Add Item"
						className="mb-6"
					/>

					<LineItemList
						lineItems={formData.lineItems || []}
						onEdit={handleUpdateLineItem}
						onRemove={handleRemoveLineItem}
						showActions={!isFormDisabled}
					/>
				</div>

				{/* Totals */}
				<div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-100">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Invoice Totals
					</h3>
					<div className="space-y-2">
						<div className="border-t border-gray-200 pt-2">
							<div className="flex justify-between text-lg font-semibold">
								<span>Total:</span>
								<span>₹{(formData.total || 0).toFixed(2)}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Form Actions */}
				<div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
					<Button
						type="button"
						variant="secondary"
						onClick={onCancel}
						disabled={isFormDisabled}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="primary"
						loading={isSubmitting}
						disabled={
							isFormDisabled ||
							!formData.clientId ||
							!formData.lineItems?.length
						}
					>
						{invoice ? "Update Invoice" : "Create Invoice"}
					</Button>
				</div>
			</form>
		);
	}
);

InvoiceForm.displayName = "InvoiceForm";

export default InvoiceForm;
