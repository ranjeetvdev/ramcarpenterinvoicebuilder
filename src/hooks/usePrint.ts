import { useCallback, useState } from "react";
import { printInvoice, printCurrentPage } from "../utils";

export interface UsePrintOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

export interface UsePrintReturn {
	isPrinting: boolean;
	printElement: (element: HTMLElement) => Promise<void>;
	printPage: () => Promise<void>;
	error: Error | null;
}

/**
 * Custom hook for managing print functionality
 */
export function usePrint(options: UsePrintOptions = {}): UsePrintReturn {
	const [isPrinting, setIsPrinting] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const printElement = useCallback(
		async (element: HTMLElement) => {
			setIsPrinting(true);
			setError(null);

			try {
				printInvoice(element);
				options.onSuccess?.();
			} catch (err) {
				const printError =
					err instanceof Error ? err : new Error("Print failed");
				setError(printError);
				options.onError?.(printError);
			} finally {
				setIsPrinting(false);
			}
		},
		[options]
	);

	const printPage = useCallback(async () => {
		setIsPrinting(true);
		setError(null);

		try {
			printCurrentPage();
			options.onSuccess?.();
		} catch (err) {
			const printError = err instanceof Error ? err : new Error("Print failed");
			setError(printError);
			options.onError?.(printError);
		} finally {
			setIsPrinting(false);
		}
	}, [options]);

	return {
		isPrinting,
		printElement,
		printPage,
		error,
	};
}

export default usePrint;
