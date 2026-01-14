// Utility functions for the Invoice Builder application

/**
 * Generate a unique ID using crypto.randomUUID if available, fallback to timestamp + random
 */
export function generateId(): string {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	// Fallback for environments without crypto.randomUUID
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format a timestamp to a readable date string in DD/MM/YYYY format
 */
export function formatDate(timestamp: number): string {
	return new Date(timestamp).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format(amount);
}

/**
 * Get current timestamp
 */
export function getCurrentTimestamp(): number {
	return Date.now();
}

/**
 * Add days to a timestamp
 */
export function addDays(timestamp: number, days: number): number {
	const date = new Date(timestamp);
	date.setDate(date.getDate() + days);
	return date.getTime();
}

/**
 * Format timestamp for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(timestamp: number): string {
	const date = new Date(timestamp);
	return date.toISOString().split("T")[0];
}

/**
 * Parse date input string to timestamp
 */
export function parseDateInput(dateString: string): number {
	const date = new Date(dateString);
	return date.getTime();
}

/**
 * Check if a timestamp represents a valid date
 */
export function isValidTimestamp(timestamp: number): boolean {
	return !isNaN(timestamp) && isFinite(timestamp) && timestamp > 0;
}

// Import types for calculation functions
import type { LineItem } from "../types";

/**
 * Calculate the total for a single line item
 * Uses totalQuantity if provided, otherwise falls back to quantity
 */
export function calculateLineItemTotal(
	quantity: number,
	unitPrice: number,
	totalQuantity?: number
): number {
	if (typeof quantity !== "number" || typeof unitPrice !== "number") {
		throw new Error("Quantity and rate must be numbers");
	}
	if (quantity < 0 || unitPrice < 0) {
		throw new Error("Quantity and rate must be non-negative");
	}
	if (
		totalQuantity !== undefined &&
		(typeof totalQuantity !== "number" || totalQuantity < 0)
	) {
		throw new Error("Total quantity must be a non-negative number");
	}

	// Use totalQuantity if provided, otherwise use main quantity
	const calculationQuantity =
		totalQuantity !== undefined ? totalQuantity : quantity;

	// Round to 2 decimal places to handle floating point precision
	return Math.round(calculationQuantity * unitPrice * 100) / 100;
}

/**
 * Calculate the subtotal for an array of line items
 */
export function calculateInvoiceSubtotal(lineItems: LineItem[]): number {
	if (!Array.isArray(lineItems)) {
		throw new Error("Line items must be an array");
	}

	const subtotal = lineItems.reduce((sum, item) => {
		const itemTotal = calculateLineItemTotal(
			item.quantity,
			item.unitPrice,
			item.totalQuantity
		);
		return sum + itemTotal;
	}, 0);

	// Round to 2 decimal places
	return Math.round(subtotal * 100) / 100;
}

/**
 * Calculate tax amount based on subtotal and tax rate
 */
export function calculateTax(subtotal: number, taxRate: number = 0): number {
	if (typeof subtotal !== "number" || typeof taxRate !== "number") {
		throw new Error("Subtotal and tax rate must be numbers");
	}
	if (subtotal < 0 || taxRate < 0) {
		throw new Error("Subtotal and tax rate must be non-negative");
	}

	const tax = subtotal * taxRate;
	// Round to 2 decimal places
	return Math.round(tax * 100) / 100;
}

/**
 * Calculate the final total (subtotal + tax)
 */
export function calculateInvoiceTotal(subtotal: number, tax: number): number {
	if (typeof subtotal !== "number" || typeof tax !== "number") {
		throw new Error("Subtotal and tax must be numbers");
	}
	if (subtotal < 0 || tax < 0) {
		throw new Error("Subtotal and tax must be non-negative");
	}

	const total = subtotal + tax;
	// Round to 2 decimal places
	return Math.round(total * 100) / 100;
}

/**
 * Calculate all totals for an invoice and return updated line items with totals
 */
export function calculateInvoiceTotals(
	lineItems: Omit<LineItem, "total">[],
	taxRate: number = 0
): {
	lineItems: LineItem[];
	subtotal: number;
	tax: number;
	total: number;
} {
	// Calculate totals for each line item
	const lineItemsWithTotals: LineItem[] = lineItems.map((item) => ({
		...item,
		total: calculateLineItemTotal(
			item.quantity,
			item.unitPrice,
			item.totalQuantity
		),
	}));

	// Calculate subtotal
	const subtotal = calculateInvoiceSubtotal(lineItemsWithTotals);

	// Calculate tax
	const tax = calculateTax(subtotal, taxRate);

	// Calculate final total
	const total = calculateInvoiceTotal(subtotal, tax);

	return {
		lineItems: lineItemsWithTotals,
		subtotal,
		tax,
		total,
	};
}

/**
 * Print an invoice by opening a new window with the invoice content
 * @param invoiceElement - The HTML element containing the invoice
 * @param filename - Optional filename for the print dialog (client name + address)
 */
export function printInvoice(
	invoiceElement: HTMLElement,
	filename?: string
): void {
	// Create a new window for printing
	const printWindow = window.open("", "_blank", "width=800,height=600");

	if (!printWindow) {
		throw new Error(
			"Unable to open print window. Please check your browser's popup settings."
		);
	}

	// Get the current page's stylesheets
	const stylesheets = Array.from(document.styleSheets)
		.map((sheet) => {
			try {
				// Try to get the href for external stylesheets
				if (sheet.href) {
					return `<link rel="stylesheet" href="${sheet.href}">`;
				}
				// For inline styles, try to extract the CSS rules
				const rules = Array.from(sheet.cssRules || sheet.rules || [])
					.map((rule) => rule.cssText)
					.join("\n");
				return rules ? `<style>${rules}</style>` : "";
			} catch (e) {
				// Cross-origin stylesheets might throw errors
				console.warn("Could not access stylesheet:", e);
				return "";
			}
		})
		.join("");

	// Set the document title for the filename
	const documentTitle = filename || "Invoice";

	// Create the print document
	const printDocument = `
		<!DOCTYPE html>
		<html>
		<head>
			<title>${documentTitle}</title>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			${stylesheets}
			<style>
				body { margin: 0; padding: 0; }
				@media print {
					body { margin: 0; }
					.no-print { display: none !important; }
				}
			</style>
		</head>
		<body>
			${invoiceElement.outerHTML}
		</body>
		</html>
	`;

	// Write the document and print
	printWindow.document.write(printDocument);
	printWindow.document.close();

	// Wait for the content to load, then print
	printWindow.onload = () => {
		printWindow.focus();
		printWindow.print();
		// Close the window after printing (optional)
		printWindow.onafterprint = () => {
			printWindow.close();
		};
	};
}

/**
 * Generate a filename for an invoice based on client name and address
 * @param clientName - The client's name
 * @param clientAddress - The client's address
 * @returns A sanitized filename string
 */
export function generateInvoiceFilename(
	clientName: string,
	clientAddress: string
): string {
	// Combine name and address
	const combined = `${clientName}_${clientAddress}`;

	// Remove or replace invalid filename characters
	// Replace spaces with underscores, remove special characters
	const sanitized = combined
		.replace(/[<>:"/\\|?*#,;]/g, "") // Remove invalid and problematic characters
		.replace(/\s+/g, "_") // Replace spaces with underscores
		.replace(/_{2,}/g, "_") // Replace multiple underscores with single
		.replace(/^_|_$/g, "") // Remove leading/trailing underscores
		.substring(0, 100); // Limit length to 100 characters

	return sanitized || "Invoice";
}

/**
 * Print the current page
 */
export function printCurrentPage(): void {
	window.print();
}

/**
 * Convert number to words (Indian numbering system)
 */
export function numberToWords(amount: number): string {
	if (amount === 0) return "Zero Rupees Only";

	const ones = [
		"",
		"One",
		"Two",
		"Three",
		"Four",
		"Five",
		"Six",
		"Seven",
		"Eight",
		"Nine",
		"Ten",
		"Eleven",
		"Twelve",
		"Thirteen",
		"Fourteen",
		"Fifteen",
		"Sixteen",
		"Seventeen",
		"Eighteen",
		"Nineteen",
	];

	const tens = [
		"",
		"",
		"Twenty",
		"Thirty",
		"Forty",
		"Fifty",
		"Sixty",
		"Seventy",
		"Eighty",
		"Ninety",
	];

	function convertHundreds(num: number): string {
		let result = "";

		if (num >= 100) {
			result += ones[Math.floor(num / 100)] + " Hundred ";
			num %= 100;
		}

		if (num >= 20) {
			result += tens[Math.floor(num / 10)] + " ";
			num %= 10;
		}

		if (num > 0) {
			result += ones[num] + " ";
		}

		return result;
	}

	// Split into rupees and paisa
	let rupees = Math.floor(amount);
	const paisa = Math.round((amount - rupees) * 100);

	let result = "";

	if (rupees === 0) {
		result = "Zero Rupees";
	} else {
		// Handle crores
		if (rupees >= 10000000) {
			result += convertHundreds(Math.floor(rupees / 10000000)) + "Crore ";
			rupees %= 10000000;
		}

		// Handle lakhs
		if (rupees >= 100000) {
			result += convertHundreds(Math.floor(rupees / 100000)) + "Lakh ";
			rupees %= 100000;
		}

		// Handle thousands
		if (rupees >= 1000) {
			result += convertHundreds(Math.floor(rupees / 1000)) + "Thousand ";
			rupees %= 1000;
		}

		// Handle hundreds
		if (rupees > 0) {
			result += convertHundreds(rupees);
		}

		result += "Rupees";
	}

	// Add paisa if present
	if (paisa > 0) {
		result += " and " + convertHundreds(paisa) + "Paisa";
	}

	return result.trim() + " Only";
}
