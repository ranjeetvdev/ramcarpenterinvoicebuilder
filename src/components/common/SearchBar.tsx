import React, { useState, useEffect, useCallback, useMemo } from "react";
import Input from "./Input";

export interface SearchBarProps {
	onSearch: (query: string) => void;
	placeholder?: string;
	debounceMs?: number;
	initialValue?: string;
	className?: string;
}

const SearchBar: React.FC<SearchBarProps> = React.memo(
	({
		onSearch,
		placeholder = "Search...",
		debounceMs = 300,
		initialValue = "",
		className = "",
	}) => {
		const [searchTerm, setSearchTerm] = useState(initialValue);

		// Debounced search effect
		useEffect(() => {
			const timer = setTimeout(() => {
				onSearch(searchTerm);
			}, debounceMs);

			return () => {
				clearTimeout(timer);
			};
		}, [searchTerm, debounceMs, onSearch]);

		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				setSearchTerm(e.target.value);
			},
			[]
		);

		const handleClear = useCallback(() => {
			setSearchTerm("");
		}, []);

		// Memoize icons to prevent re-creation on every render
		const searchIcon = useMemo(
			() => (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
					/>
				</svg>
			),
			[]
		);

		const clearButton = useMemo(
			() =>
				searchTerm ? (
					<button
						type="button"
						onClick={handleClear}
						className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
						aria-label="Clear search"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="h-5 w-5"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				) : null,
			[searchTerm, handleClear]
		);

		return (
			<div className={className}>
				<Input
					type="text"
					value={searchTerm}
					onChange={handleChange}
					placeholder={placeholder}
					leftIcon={searchIcon}
					rightIcon={clearButton}
					aria-label="Search"
				/>
			</div>
		);
	}
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
