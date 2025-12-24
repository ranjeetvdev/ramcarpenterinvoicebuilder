import React, { useCallback } from "react";
import type { LineItem } from "../../types";
import { Button } from "../common";

export interface LineItemListProps {
	lineItems: LineItem[];
	onEdit?: (lineItem: LineItem) => void;
	onRemove?: (lineItemId: string) => void;
	showActions?: boolean;
	className?: string;
}

const LineItemList: React.FC<LineItemListProps> = ({
	lineItems,
	onEdit,
	onRemove,
	showActions = true,
	className = "",
}) => {
	const handleEdit = useCallback(
		(lineItem: LineItem) => {
			if (onEdit) {
				onEdit(lineItem);
			}
		},
		[onEdit]
	);

	const handleRemove = useCallback(
		(lineItemId: string) => {
			if (onRemove) {
				onRemove(lineItemId);
			}
		},
		[onRemove]
	);

	const calculateSubtotal = useCallback(() => {
		return lineItems.reduce((sum, item) => sum + item.total, 0);
	}, [lineItems]);

	if (lineItems.length === 0) {
		return (
			<div className={`text-center py-8 ${className}`}>
				<div className="text-gray-400 mb-2">
					<svg
						className="mx-auto h-12 w-12"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
				</div>
				<h3 className="text-sm font-medium text-gray-900">No line items</h3>
				<p className="text-sm text-gray-500">
					Add your first line item to get started.
				</p>
			</div>
		);
	}

	return (
		<div className={className}>
			<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
				<table className="min-w-full divide-y divide-gray-300">
					<thead className="bg-gray-50">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
							>
								Sr. No.
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Description
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Unit Price
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Quantity
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Total
							</th>
							{showActions && (
								<th scope="col" className="relative px-6 py-3">
									<span className="sr-only">Actions</span>
								</th>
							)}
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{lineItems.map((item, index) => (
							<tr
								key={item.id}
								className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
							>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
									{index + 1}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									<div className="max-w-xs truncate" title={item.description}>
										{item.description}
									</div>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									₹{item.unitPrice.toFixed(2)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{item.quantity}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									₹{item.total.toFixed(2)}
								</td>
								{showActions && (
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex space-x-2 justify-end">
											{onEdit && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEdit(item)}
													aria-label={`Edit ${item.description}`}
												>
													<svg
														className="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
														/>
													</svg>
												</Button>
											)}
											{onRemove && (
												<Button
													variant="danger"
													size="sm"
													onClick={() => handleRemove(item.id)}
													aria-label={`Remove ${item.description}`}
												>
													<svg
														className="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												</Button>
											)}
										</div>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Subtotal row */}
			<div className="mt-4 flex justify-end">
				<div className="bg-gray-50 px-6 py-3 rounded-md">
					<div className="flex items-center space-x-4">
						<span className="text-sm font-medium text-gray-700">Subtotal:</span>
						<span className="text-lg font-semibold text-gray-900">
							₹{calculateSubtotal().toFixed(2)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LineItemList;
