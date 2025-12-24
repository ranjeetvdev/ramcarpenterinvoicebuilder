import React, { useState, useMemo, useRef, useEffect } from "react";
import type { Client } from "../../types";
import Input from "../common/Input";

export interface ClientSelectorProps {
	clients: Client[];
	selectedClientId?: string | null;
	onSelect: (client: Client) => void;
	onCreateNew?: () => void;
	label?: string;
	placeholder?: string;
	error?: string;
	disabled?: boolean;
	required?: boolean;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
	clients,
	selectedClientId,
	onSelect,
	onCreateNew,
	label = "Select Client",
	placeholder = "Search for a client...",
	error,
	disabled = false,
	required = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Get selected client
	const selectedClient = useMemo(() => {
		return clients.find((client) => client.id === selectedClientId) || null;
	}, [clients, selectedClientId]);

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
				client.phone.toLowerCase().includes(query)
		);
	}, [clients, searchQuery]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setSearchQuery("");
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	const handleToggle = () => {
		if (!disabled) {
			setIsOpen(!isOpen);
			if (!isOpen) {
				// Focus input when opening
				setTimeout(() => inputRef.current?.focus(), 0);
			}
		}
	};

	const handleSelect = (client: Client) => {
		onSelect(client);
		setIsOpen(false);
		setSearchQuery("");
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleCreateNew = () => {
		if (onCreateNew) {
			onCreateNew();
			setIsOpen(false);
			setSearchQuery("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setIsOpen(false);
			setSearchQuery("");
		}
	};

	return (
		<div className="relative" ref={dropdownRef}>
			{label && (
				<label className="block text-sm font-semibold text-gray-700 mb-2">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}

			<button
				type="button"
				onClick={handleToggle}
				disabled={disabled}
				className={`relative w-full bg-white border rounded-lg shadow-sm px-4 py-3 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 ease-in-out ${
					error
						? "border-red-300 text-red-900 focus:ring-red-500 focus:ring-opacity-20 focus:border-red-500"
						: "border-gray-300"
				} ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-labelledby="client-selector-label"
			>
				<span className="block truncate text-gray-900">
					{selectedClient ? (
						selectedClient.name
					) : (
						<span className="text-gray-400">{placeholder}</span>
					)}
				</span>
				<span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
					<svg
						className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
							isOpen ? "transform rotate-180" : ""
						}`}
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</span>
			</button>

			{error && (
				<p className="mt-2 text-sm text-red-600 flex items-center" role="alert">
					<svg
						className="h-4 w-4 mr-1 flex-shrink-0"
						fill="currentColor"
						viewBox="0 0 20 20"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clipRule="evenodd"
						/>
					</svg>
					{error}
				</p>
			)}

			{isOpen && (
				<div className="absolute z-10 mt-2 w-full bg-white shadow-xl max-h-96 rounded-lg py-2 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none border border-gray-200">
					<div className="sticky top-0 z-10 bg-white px-3 py-3 border-b border-gray-100">
						<Input
							ref={inputRef}
							type="text"
							value={searchQuery}
							onChange={handleSearchChange}
							onKeyDown={handleKeyDown}
							placeholder="Search clients..."
							variant="outlined"
							leftIcon={
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
									/>
								</svg>
							}
						/>
					</div>

					{onCreateNew && (
						<button
							type="button"
							onClick={handleCreateNew}
							className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 flex items-center border-b border-gray-100 transition-colors duration-150"
						>
							<svg
								className="h-5 w-5 mr-3"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Create New Client
						</button>
					)}

					{filteredClients.length === 0 ? (
						<div className="px-3 py-8 text-center text-sm text-gray-500">
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
							<p className="mt-2">No clients found</p>
							{searchQuery && (
								<p className="mt-1 text-xs">Try adjusting your search</p>
							)}
						</div>
					) : (
						<ul
							className="max-h-60 overflow-auto"
							role="listbox"
							aria-labelledby="client-selector-label"
						>
							{filteredClients.map((client) => (
								<li
									key={client.id}
									onClick={() => handleSelect(client)}
									className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 ${
										selectedClientId === client.id
											? "bg-blue-50 text-blue-900"
											: "text-gray-900"
									}`}
									role="option"
									aria-selected={selectedClientId === client.id}
								>
									<div className="flex flex-col">
										<span
											className={`block truncate ${
												selectedClientId === client.id
													? "font-semibold"
													: "font-normal"
											}`}
										>
											{client.name}
										</span>
										<span className="text-xs text-gray-500 truncate">
											{client.email || client.phone || "No contact info"}
										</span>
									</div>

									{selectedClientId === client.id && (
										<span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
											<svg
												className="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
												aria-hidden="true"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</span>
									)}
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
};

export default ClientSelector;
