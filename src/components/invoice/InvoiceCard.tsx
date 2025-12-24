import React from "react";
import type { Invoice } from "../../types";
import { Button } from "../common";

export interface InvoiceCardProps {
	invoice: Invoice;
	onEdit: (invoice: Invoice) => void;
	onDelete: (invoiceId: string) => void;
	onView: (invoice: Invoice) => void;
	className?: string;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
	invoice,
	onEdit,
	onDelete,
	onView,
	className = "",
}) => {
	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString();
	};

	const formatCurrency = (amount: number) => {
		return `$${amount.toFixed(2)}`;
	};

	const getStatusBadgeClass = (status: Invoice["status"]) => {
		switch (status) {
			case "draft":
				return "bg-gray-100 text-gray-800 border-gray-200";
			case "issued":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "paid":
				return "bg-green-100 text-green-800 border-green-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const isOverdue = (invoice: Invoice) => {
		return invoice.status === "issued" && invoice.dueDate < Date.now();
	};

	const getCardBorderClass = () => {
		if (isOverdue(invoice)) {
			return "border-red-200 shadow-red-100";
		}
		switch (invoice.status) {
			case "paid":
				return "border-green-200 shadow-green-100";
			case "issued":
				return "border-yellow-200 shadow-yellow-100";
			default:
				return "border-gray-200";
		}
	};

	return (
		<div
			className={`bg-white rounded-lg border-2 ${getCardBorderClass()} shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
		>
			{/* Header */}
			<div className="p-6 pb-4">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="flex items-center space-x-3">
							<h3 className="text-lg font-semibold text-gray-900">
								{invoice.invoiceNumber}
							</h3>
							<span
								className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(
									invoice.status
								)}`}
							>
								{invoice.status.charAt(0).toUpperCase() +
									invoice.status.slice(1)}
							</span>
							{isOverdue(invoice) && (
								<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
									Overdue
								</span>
							)}
						</div>
						<p className="mt-1 text-sm text-gray-600">
							Created {formatDate(invoice.createdAt)}
						</p>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-gray-900">
							{formatCurrency(invoice.total)}
						</div>
						<div className="text-sm text-gray-500">
							{invoice.lineItems.length} item
							{invoice.lineItems.length !== 1 ? "s" : ""}
						</div>
					</div>
				</div>
			</div>

			{/* Client Information */}
			<div className="px-6 pb-4">
				<div className="bg-gray-50 rounded-lg p-4">
					<h4 className="text-sm font-medium text-gray-900 mb-2">Client</h4>
					<div className="space-y-1">
						<p className="text-sm font-medium text-gray-900">
							{invoice.client.name}
						</p>
						{invoice.client.email && (
							<p className="text-sm text-gray-600">{invoice.client.email}</p>
						)}
						{invoice.client.phone && (
							<p className="text-sm text-gray-600">{invoice.client.phone}</p>
						)}
						{invoice.client.address && (
							<p className="text-sm text-gray-600">{invoice.client.address}</p>
						)}
					</div>
				</div>
			</div>

			{/* Invoice Details */}
			<div className="px-6 pb-4">
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span className="text-gray-500">Issue Date:</span>
						<p className="font-medium text-gray-900">
							{formatDate(invoice.issueDate)}
						</p>
					</div>
					<div>
						<span className="text-gray-500">Due Date:</span>
						<p
							className={`font-medium ${
								isOverdue(invoice) ? "text-red-600" : "text-gray-900"
							}`}
						>
							{formatDate(invoice.dueDate)}
						</p>
					</div>
				</div>
			</div>

			{/* Line Items Preview */}
			<div className="px-6 pb-4">
				<h4 className="text-sm font-medium text-gray-900 mb-2">Items</h4>
				<div className="space-y-2">
					{invoice.lineItems.slice(0, 3).map((item) => (
						<div key={item.id} className="flex justify-between text-sm">
							<span className="text-gray-600 truncate flex-1 mr-2">
								{item.description}
							</span>
							<span className="text-gray-900 font-medium whitespace-nowrap">
								{item.quantity} × {formatCurrency(item.unitPrice)} ={" "}
								{formatCurrency(item.total)}
							</span>
						</div>
					))}
					{invoice.lineItems.length > 3 && (
						<p className="text-sm text-gray-500 italic">
							+{invoice.lineItems.length - 3} more item
							{invoice.lineItems.length - 3 !== 1 ? "s" : ""}
						</p>
					)}
				</div>
			</div>

			{/* Totals */}
			<div className="px-6 pb-4">
				<div className="bg-gray-50 rounded-lg p-3 space-y-1">
					<div className="flex justify-between text-sm">
						<span className="text-gray-600">Subtotal:</span>
						<span className="text-gray-900">
							{formatCurrency(invoice.subtotal)}
						</span>
					</div>
					{invoice.tax > 0 && (
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">Tax:</span>
							<span className="text-gray-900">
								{formatCurrency(invoice.tax)}
							</span>
						</div>
					)}
					<div className="border-t border-gray-200 pt-1">
						<div className="flex justify-between text-sm font-semibold">
							<span className="text-gray-900">Total:</span>
							<span className="text-gray-900">
								{formatCurrency(invoice.total)}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Notes */}
			{invoice.notes && (
				<div className="px-6 pb-4">
					<h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
					<p className="text-sm text-gray-600 line-clamp-2">{invoice.notes}</p>
				</div>
			)}

			{/* Actions */}
			<div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
				<div className="flex justify-between items-center">
					<div className="text-xs text-gray-500">
						Last updated {formatDate(invoice.updatedAt)}
					</div>
					<div className="flex space-x-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onView(invoice)}
							className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
						>
							<svg
								className="w-4 h-4 mr-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
							View
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onEdit(invoice)}
							className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
						>
							<svg
								className="w-4 h-4 mr-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
							Edit
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onDelete(invoice.id)}
							className="text-red-600 hover:text-red-700 hover:bg-red-50"
						>
							<svg
								className="w-4 h-4 mr-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							Delete
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InvoiceCard;
