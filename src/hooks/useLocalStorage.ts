import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for syncing state with local storage
 * Provides error handling for storage operations
 * Requirements: 1.5, 5.3, 5.5
 */
export function useLocalStorage<T>(
	key: string,
	initialValue: T
): [T, (value: T | ((val: T) => T)) => void, Error | null] {
	const [error, setError] = useState<Error | null>(null);

	// Get initial value from localStorage or use provided initial value
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			setError(null);
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown storage error";
			const storageError = new Error(
				`Failed to read from localStorage: ${errorMessage}`
			);
			setError(storageError);
			console.error("useLocalStorage read error:", storageError);
			return initialValue;
		}
	});

	// Return a wrapped version of useState's setter function that persists the new value to localStorage
	const setValue = useCallback(
		(value: T | ((val: T) => T)) => {
			try {
				setError(null);
				// Allow value to be a function so we have the same API as useState
				const valueToStore =
					value instanceof Function ? value(storedValue) : value;

				// Save state
				setStoredValue(valueToStore);

				// Save to local storage
				if (typeof window !== "undefined") {
					window.localStorage.setItem(key, JSON.stringify(valueToStore));
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown storage error";
				const storageError = new Error(
					`Failed to write to localStorage: ${errorMessage}`
				);
				setError(storageError);
				console.error("useLocalStorage write error:", storageError);
			}
		},
		[key, storedValue]
	);

	// Listen for changes to localStorage from other tabs/windows
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue !== null) {
				try {
					setError(null);
					const newValue = JSON.parse(e.newValue);
					setStoredValue(newValue);
				} catch (err) {
					const errorMessage =
						err instanceof Error ? err.message : "Unknown storage error";
					const storageError = new Error(
						`Failed to sync localStorage change: ${errorMessage}`
					);
					setError(storageError);
					console.error("useLocalStorage sync error:", storageError);
				}
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("storage", handleStorageChange);
			return () => window.removeEventListener("storage", handleStorageChange);
		}
	}, [key]);

	return [storedValue, setValue, error];
}
