import React, { useState, useMemo } from "react";
import type { Client } from "../../types";
import SearchBar from "../common/SearchBar";
import Button from "../common/Button";

export interface ClientListProps {
	clients: Client[];
	onEdit: (client: Client) => void;
	onDelete: (clientId: string) => void;
	onSelect?: (client: Client) => void;
	loading?: boolean;
	searchable?: boolean;
	selectable?: boolean;
	emptyMessage?: string;
}

const ClientList: React.FC<ClientListProps> = React.memo(
	({
		clients,
		onEdit,
		onDelete,
		onSelect,
		loading = false,
		searchable = true,
		selectable = false,
		emptyMessage = "No clients found",
	}) => {
		const [searchQuery, setSearchQuery] = useState("");

		// Filter clients based on search query
		const filteredClients = useMemo(() => {
			if (!searchQuery.trim()) {
				return clients;
			}

			const query = searchQuery.toLowerCase();
			return clients.filter(
				(client) =>
					client.name.toLowerCase().includes(query) ||
					client.email.toLowerCase().includes(query) ||
					client.phone.toLowerCase().includes(query) ||
					client.address.toLowerCase().includes(query)
			);
		}, [clients, searchQuery]);

		const handleSearch = (query: string) => {
			setSearchQuery(query);
		};

		const handleEdit = (client: Client) => {
			onEdit(client);
		};

		const handleDelete = (clientId: string) => {
			if (window.confirm("Are you sure you want to delete this client?")) {
				onDelete(clientId);
			}
		};

		const handleSelect = (client: Client) => {
			if (onSelect) {
				onSelect(client);
			}
		};

		const formatDate = (timestamp: number) => {
			return new Date(timestamp).toLocaleDateString();
		};

		if (loading) {
			return (
				<div className="flex justify-center items-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="ml-2 text-gray-600">Loading clients...</span>
				</div>
			);
		}

		return (
			<div className="space-y-6">
				{searchable && (
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
						<SearchBar
							onSearch={handleSearch}
							placeholder="Search clients by name, email, phone, or address..."
							className="flex-1 sm:max-w-md"
						/>
						<div className="text-sm text-gray-500 text-center sm:text-right whitespace-nowrap">
							{filteredClients.length} of {clients.length} clients
						</div>
					</div>
				)}

				{filteredClients.length === 0 ? (
					<div className="text-center py-12">
						<svg
							className="mx-auto h-12 w-12 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							{emptyMessage}
						</h3>
						{searchQuery && (
							<p className="mt-1 text-sm text-gray-500">
								Try adjusting your search terms
							</p>
						)}
					</div>
				) : (
					<div className="bg-white shadow overflow-hidden sm:rounded-md">
						<ul
							className="divide-y divide-gray-200"
							role="list"
							aria-label="Clients list"
						>
							{filteredClients.map((client) => (
								<li key={client.id}>
									<div
										className={`px-4 py-4 flex items-center justify-between hover:bg-gray-50 focus-within:bg-gray-50 ${
											selectable ? "cursor-pointer" : ""
										}`}
										onClick={
											selectable ? () => handleSelect(client) : undefined
										}
										role={selectable ? "button" : undefined}
										tabIndex={selectable ? 0 : undefined}
										onKeyDown={
											selectable
												? (e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															handleSelect(client);
														}
												  }
												: undefined
										}
										aria-label={
											selectable ? `Select client ${client.name}` : undefined
										}
									>
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<p className="text-sm font-medium text-gray-900 truncate">
														{client.name}
													</p>
													<div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
														{client.email && (
															<div className="flex items-center text-sm text-gray-500">
																<svg
																	className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
																	/>
																</svg>
																<span className="truncate">{client.email}</span>
															</div>
														)}
														{client.phone && (
															<div className="flex items-center text-sm text-gray-500">
																<svg
																	className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
																	/>
																</svg>
																<span>{client.phone}</span>
															</div>
														)}
													</div>
													{client.address && (
														<div className="mt-1 flex items-center text-sm text-gray-500">
															<svg
																className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
																/>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
																/>
															</svg>
															<span className="truncate">{client.address}</span>
														</div>
													)}
													<div className="mt-1 text-xs text-gray-400">
														Created: {formatDate(client.createdAt)}
													</div>
												</div>
											</div>
										</div>

										{!selectable && (
											<div
												className="flex items-center space-x-2 ml-4"
												role="group"
												aria-label={`Actions for ${client.name}`}
											>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEdit(client)}
													aria-label={`Edit ${client.name}`}
												>
													<svg
														className="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														aria-hidden="true"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
														/>
													</svg>
													<span className="sr-only">Edit</span>
													Edit
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(client.id)}
													aria-label={`Delete ${client.name}`}
													className="text-red-600 hover:text-red-700 hover:bg-red-50"
												>
													<svg
														className="h-4 w-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														aria-hidden="true"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
													<span className="sr-only">Delete</span>
													Delete
												</Button>
											</div>
										)}

										{selectable && (
											<div className="ml-4">
												<svg
													className="h-5 w-5 text-gray-400"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 5l7 7-7 7"
													/>
												</svg>
											</div>
										)}
									</div>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		);
	}
);

ClientList.displayName = "ClientList";

export default ClientList;
