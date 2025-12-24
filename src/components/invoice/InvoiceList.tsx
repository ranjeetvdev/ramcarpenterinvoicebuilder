import React, { useState, useMemo, useCallback } from "react";
import type { Invoice } from "../../types";
import { Button, SearchBar } from "../common";

export interface InvoiceListProps {
	invoices: Invoice[];
	onEdit: (invoice: Invoice) => void;
	onDelete: (invoiceId: string) => void;
	onView: (invoice: Invoice) => void;
	loading?: boolean;
	className?: string;
}

type SortField =
	| "invoiceNumber"
	| "clientName"
	| "issueDate"
	| "dueDate"
	| "total"
	| "status";
type SortDirection = "asc" | "desc";

interface FilterOptions {
	status: Invoice["status"] | "all";
	dateRange: "all" | "last30" | "last90" | "thisYear";
}

const InvoiceList: React.FC<InvoiceListProps> = React.memo(
	({ invoices, onEdit, onDelete, onView, loading = false, className = "" }) => {
		const [searchQuery, setSearchQuery] = useState("");
		const [sortField, setSortField] = useState<SortField>("issueDate");
		const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
		const [filters, setFilters] = useState<FilterOptions>({
			status: "all",
			dateRange: "all",
		});

		// Filter and search invoices
		const filteredInvoices = useMemo(() => {
			let filtered = [...invoices];

			// Apply search filter
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				filtered = filtered.filter(
					(invoice) =>
						invoice.invoiceNumber.toLowerCase().includes(query) ||
						invoice.client.name.toLowerCase().includes(query) ||
						invoice.client.email.toLowerCase().includes(query) ||
						invoice.notes.toLowerCase().includes(query)
				);
			}

			// Apply status filter
			if (filters.status !== "all") {
				filtered = filtered.filter(
					(invoice) => invoice.status === filters.status
				);
			}

			// Apply date range filter
			if (filters.dateRange !== "all") {
				const now = Date.now();
				let cutoffDate = 0;

				switch (filters.dateRange) {
					case "last30":
						cutoffDate = now - 30 * 24 * 60 * 60 * 1000;
						break;
					case "last90":
						cutoffDate = now - 90 * 24 * 60 * 60 * 1000;
						break;
					case "thisYear":
						cutoffDate = new Date(new Date().getFullYear(), 0, 1).getTime();
						break;
				}

				filtered = filtered.filter(
					(invoice) => invoice.issueDate >= cutoffDate
				);
			}

			// Apply sorting
			filtered.sort((a, b) => {
				let aValue: any;
				let bValue: any;

				switch (sortField) {
					case "invoiceNumber":
						aValue = a.invoiceNumber;
						bValue = b.invoiceNumber;
						break;
					case "clientName":
						aValue = a.client.name;
						bValue = b.client.name;
						break;
					case "issueDate":
						aValue = a.issueDate;
						bValue = b.issueDate;
						break;
					case "dueDate":
						aValue = a.dueDate;
						bValue = b.dueDate;
						break;
					case "total":
						aValue = a.total;
						bValue = b.total;
						break;
					case "status":
						aValue = a.status;
						bValue = b.status;
						break;
					default:
						aValue = a.issueDate;
						bValue = b.issueDate;
				}

				if (typeof aValue === "string") {
					aValue = aValue.toLowerCase();
					bValue = bValue.toLowerCase();
				}

				if (aValue < bValue) {
					return sortDirection === "asc" ? -1 : 1;
				}
				if (aValue > bValue) {
					return sortDirection === "asc" ? 1 : -1;
				}
				return 0;
			});

			return filtered;
		}, [invoices, searchQuery, sortField, sortDirection, filters]);

		const handleSort = useCallback(
			(field: SortField) => {
				if (sortField === field) {
					setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
				} else {
					setSortField(field);
					setSortDirection("asc");
				}
			},
			[sortField]
		);

		const handleFilterChange = useCallback(
			(filterType: keyof FilterOptions, value: string) => {
				setFilters((prev) => ({
					...prev,
					[filterType]: value,
				}));
			},
			[]
		);

		const formatDate = (timestamp: number) => {
			return new Date(timestamp).toLocaleDateString();
		};

		const formatCurrency = (amount: number) => {
			return `₹${amount.toFixed(2)}`;
		};

		const getStatusBadgeClass = (status: Invoice["status"]) => {
			switch (status) {
				case "draft":
					return "bg-gray-100 text-gray-800";
				case "issued":
					return "bg-yellow-100 text-yellow-800";
				case "paid":
					return "bg-green-100 text-green-800";
				default:
					return "bg-gray-100 text-gray-800";
			}
		};

		const isOverdue = (invoice: Invoice) => {
			return invoice.status === "issued" && invoice.dueDate < Date.now();
		};

		const SortButton: React.FC<{
			field: SortField;
			children: React.ReactNode;
		}> = React.memo(({ field, children }) => (
			<button
				onClick={() => handleSort(field)}
				className="group inline-flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
				aria-label={`Sort by ${children}${
					sortField === field
						? ` (currently ${
								sortDirection === "asc" ? "ascending" : "descending"
						  })`
						: ""
				}`}
			>
				<span>{children}</span>
				<span
					className="ml-2 flex-none rounded text-gray-400 group-hover:text-gray-500"
					aria-hidden="true"
				>
					{sortField === field ? (
						sortDirection === "asc" ? (
							<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
									clipRule="evenodd"
								/>
							</svg>
						) : (
							<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
						)
					) : (
						<svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
							<path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
						</svg>
					)}
				</span>
			</button>
		));

		if (loading) {
			return (
				<div className={`flex items-center justify-center py-12 ${className}`}>
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="ml-2 text-gray-600">Loading invoices...</span>
				</div>
			);
		}

		return (
			<div className={`space-y-6 ${className}`}>
				{/* Search and Filters */}
				<div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-100">
					<div className="space-y-4">
						<SearchBar
							onSearch={setSearchQuery}
							initialValue={searchQuery}
							placeholder="Search invoices by number, client name, or email..."
							className="w-full"
						/>

						<div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
							<div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
								<label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
									Status:
								</label>
								<select
									value={filters.status}
									onChange={(e) => handleFilterChange("status", e.target.value)}
									className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 hover:border-gray-400 transition-all duration-200 ease-in-out min-w-0 flex-1 sm:flex-initial"
									aria-label="Filter by status"
								>
									<option value="all">All Statuses</option>
									<option value="draft">Draft</option>
									<option value="issued">Issued</option>
									<option value="paid">Paid</option>
								</select>
							</div>

							<div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
								<label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
									Date Range:
								</label>
								<select
									value={filters.dateRange}
									onChange={(e) =>
										handleFilterChange("dateRange", e.target.value)
									}
									className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 hover:border-gray-400 transition-all duration-200 ease-in-out min-w-0 flex-1 sm:flex-initial"
									aria-label="Filter by date range"
								>
									<option value="all">All Time</option>
									<option value="last30">Last 30 Days</option>
									<option value="last90">Last 90 Days</option>
									<option value="thisYear">This Year</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Results Summary */}
				<div className="text-sm text-gray-600 px-1">
					Showing {filteredInvoices.length} of {invoices.length} invoices
				</div>

				{/* Invoice Table */}
				<div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
					{filteredInvoices.length === 0 ? (
						<div className="text-center py-12">
							<svg
								className="mx-auto h-12 w-12 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<h3 className="mt-2 text-sm font-medium text-gray-900">
								No invoices found
							</h3>
							<p className="mt-1 text-sm text-gray-500">
								{searchQuery ||
								filters.status !== "all" ||
								filters.dateRange !== "all"
									? "Try adjusting your search or filters."
									: "Get started by creating your first invoice."}
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table
								className="min-w-full divide-y divide-gray-200"
								role="table"
								aria-label="Invoices table"
							>
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											<SortButton field="invoiceNumber">Invoice #</SortButton>
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											<SortButton field="clientName">Client</SortButton>
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											<SortButton field="issueDate">Issue Date</SortButton>
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											<SortButton field="dueDate">Due Date</SortButton>
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											<SortButton field="total">Total</SortButton>
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											<SortButton field="status">Status</SortButton>
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredInvoices.map((invoice) => (
										<tr key={invoice.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{invoice.invoiceNumber}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{invoice.client.name}
												</div>
												<div className="text-sm text-gray-500">
													{invoice.client.email}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												<time
													dateTime={new Date(invoice.issueDate).toISOString()}
												>
													{formatDate(invoice.issueDate)}
												</time>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												<time
													dateTime={new Date(invoice.dueDate).toISOString()}
													className={
														isOverdue(invoice) ? "text-red-600 font-medium" : ""
													}
												>
													{formatDate(invoice.dueDate)}
													{isOverdue(invoice) && (
														<span
															className="ml-1 text-xs"
															aria-label="This invoice is overdue"
														>
															(Overdue)
														</span>
													)}
												</time>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												<span
													aria-label={`Total amount: ${formatCurrency(
														invoice.total
													)}`}
												>
													{formatCurrency(invoice.total)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
														invoice.status
													)}`}
													aria-label={`Invoice status: ${invoice.status}`}
												>
													{invoice.status.charAt(0).toUpperCase() +
														invoice.status.slice(1)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
												<div
													className="flex justify-end space-x-2"
													role="group"
													aria-label={`Actions for invoice ${invoice.invoiceNumber}`}
												>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => onView(invoice)}
														aria-label={`View invoice ${invoice.invoiceNumber}`}
													>
														View
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => onEdit(invoice)}
														aria-label={`Edit invoice ${invoice.invoiceNumber}`}
													>
														Edit
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => onDelete(invoice.id)}
														className="text-red-600 hover:text-red-700"
														aria-label={`Delete invoice ${invoice.invoiceNumber}`}
													>
														Delete
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		);
	}
);

InvoiceList.displayName = "InvoiceList";

export default InvoiceList;
