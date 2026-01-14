// Core data model types for the Invoice Builder application

export interface Client {
	id: string;
	name: string;
	address: string;
	phone: string;
	email: string;
	createdAt: number;
}

export interface LineItem {
	id: string;
	description: string;
	quantity: number;
	unitPrice: number;
	total: number;
	// New optional fields for enhanced functionality
	unit?: string; // Unit of measurement (e.g., "sq ft", "ft", "NO", "piece")
	totalQuantity?: number; // Optional total quantity for additional tracking
}

export interface Invoice {
	id: string;
	invoiceNumber: string;
	clientId: string;
	client: Client;
	lineItems: LineItem[];
	subtotal: number;
	tax: number;
	total: number;
	issueDate: number;
	dueDate: number;
	notes: string;
	status: "draft" | "issued" | "paid";
	stamp?: string; // Base64 encoded image or URL
	createdAt: number;
	updatedAt: number;
}

export type ClientData = Omit<Client, "id" | "createdAt">;
export type InvoiceData = Omit<
	Invoice,
	"id" | "invoiceNumber" | "createdAt" | "updatedAt"
>;

// Validation result type
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

// Validation functions
export function validateClient(client: Partial<ClientData>): ValidationResult {
	const errors: string[] = [];

	// Name validation
	if (
		!client.name ||
		typeof client.name !== "string" ||
		client.name.trim().length === 0
	) {
		errors.push("Name is required");
	} else if (client.name.length > 200) {
		errors.push("Name must be 200 characters or less");
	}

	// Address validation (optional)
	if (
		client.address &&
		typeof client.address === "string" &&
		client.address.length > 500
	) {
		errors.push("Address must be 500 characters or less");
	}

	// Phone validation (optional, flexible format)
	if (client.phone && typeof client.phone === "string") {
		// Basic phone validation - allow various formats
		const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
		if (!phoneRegex.test(client.phone)) {
			errors.push("Phone number contains invalid characters");
		}
	}

	// Email validation (optional)
	if (client.email && typeof client.email === "string") {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(client.email)) {
			errors.push("Email format is invalid");
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

export function validateLineItem(
	lineItem: Partial<LineItem>
): ValidationResult {
	const errors: string[] = [];

	// Description validation
	if (
		!lineItem.description ||
		typeof lineItem.description !== "string" ||
		lineItem.description.trim().length === 0
	) {
		errors.push("Description is required");
	} else if (lineItem.description.length > 500) {
		errors.push("Description must be 500 characters or less");
	}

	// Quantity validation
	if (typeof lineItem.quantity !== "number" || lineItem.quantity <= 0) {
		errors.push("Quantity must be a positive number greater than 0");
	}

	// Unit price validation
	if (typeof lineItem.unitPrice !== "number" || lineItem.unitPrice < 0) {
		errors.push("Rate must be a non-negative number");
	}

	// Total validation (if provided, should match calculation logic)
	if (
		typeof lineItem.total === "number" &&
		typeof lineItem.quantity === "number" &&
		typeof lineItem.unitPrice === "number"
	) {
		// Use totalQuantity if provided, otherwise use main quantity
		const calculationQuantity =
			lineItem.totalQuantity !== undefined
				? lineItem.totalQuantity
				: lineItem.quantity;
		const expectedTotal = calculationQuantity * lineItem.unitPrice;
		if (Math.abs(lineItem.total - expectedTotal) > 0.01) {
			// Allow for small floating point differences
			const quantityUsed =
				lineItem.totalQuantity !== undefined ? "total quantity" : "quantity";
			errors.push(`Total must equal ${quantityUsed} multiplied by rate`);
		}
	}

	// New validations for enhanced fields
	// Unit validation (optional field)
	if (lineItem.unit !== undefined) {
		if (typeof lineItem.unit !== "string") {
			errors.push("Unit must be a string");
		} else if (lineItem.unit.length > 20) {
			errors.push("Unit must be 20 characters or less");
		}
	}

	// Total quantity validation (optional field)
	if (lineItem.totalQuantity !== undefined) {
		if (
			typeof lineItem.totalQuantity !== "number" ||
			lineItem.totalQuantity <= 0
		) {
			errors.push("Total quantity must be a positive number greater than 0");
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

export function validateInvoice(invoice: Partial<Invoice>): ValidationResult {
	const errors: string[] = [];

	// Client ID validation
	if (
		!invoice.clientId ||
		typeof invoice.clientId !== "string" ||
		invoice.clientId.trim().length === 0
	) {
		errors.push("Client ID is required");
	}

	// Line items validation
	if (
		!invoice.lineItems ||
		!Array.isArray(invoice.lineItems) ||
		invoice.lineItems.length === 0
	) {
		errors.push("Invoice must contain at least one line item");
	} else {
		// Validate each line item
		invoice.lineItems.forEach((item, index) => {
			const itemValidation = validateLineItem(item);
			if (!itemValidation.isValid) {
				itemValidation.errors.forEach((error) => {
					errors.push(`Line item ${index + 1}: ${error}`);
				});
			}
		});
	}

	// Issue date validation
	if (typeof invoice.issueDate !== "number" || isNaN(invoice.issueDate)) {
		errors.push("Issue date must be a valid timestamp");
	}

	// Due date validation (optional - only validate if provided)
	if (invoice.dueDate !== undefined) {
		if (typeof invoice.dueDate !== "number" || isNaN(invoice.dueDate)) {
			errors.push("Due date must be a valid timestamp");
		} else if (
			typeof invoice.issueDate === "number" &&
			invoice.dueDate < invoice.issueDate
		) {
			errors.push("Due date must be on or after the issue date");
		}
	}

	// Status validation (optional - only validate if provided)
	if (invoice.status !== undefined) {
		const validStatuses = ["draft", "issued", "paid"];
		if (!validStatuses.includes(invoice.status)) {
			errors.push("Status must be one of: draft, issued, paid");
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}
