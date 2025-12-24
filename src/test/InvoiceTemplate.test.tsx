import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import InvoiceTemplate from "../components/invoice/InvoiceTemplate";
import type { Invoice } from "../types";

// Mock invoice data for testing
const mockInvoice: Invoice = {
	id: "test-invoice-1",
	invoiceNumber: "INV-001",
	clientId: "test-client-1",
	client: {
		id: "test-client-1",
		name: "Test Client",
		address: "123 Test Street, Test City, TC 12345",
		phone: "(555) 123-4567",
		email: "test@example.com",
		createdAt: Date.now(),
	},
	lineItems: [
		{
			id: "item-1",
			description: "Custom Cabinet Installation",
			quantity: 2,
			unitPrice: 500,
			total: 1000,
		},
		{
			id: "item-2",
			description: "Hardwood Flooring",
			quantity: 100,
			unitPrice: 15,
			total: 1500,
		},
	],
	subtotal: 2500,
	tax: 0, // No tax
	total: 2500, // Total equals subtotal since no tax
	issueDate: Date.now(),
	dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
	notes:
		"Payment due within 30 days. Need repairs, upgrades, or custom work in the future? RAM Carpenters is just a call away",
	status: "issued",
	createdAt: Date.now(),
	updatedAt: Date.now(),
};

describe("InvoiceTemplate", () => {
	it("renders invoice with all required information", () => {
		render(<InvoiceTemplate invoice={mockInvoice} />);

		// Check business branding (appears in header and signatory)
		expect(
			screen.getAllByText("Ram Carpenter Services").length
		).toBeGreaterThan(0);
		expect(screen.getByText("INVOICE")).toBeInTheDocument();

		// Check invoice number
		expect(screen.getByText("INV-001")).toBeInTheDocument();

		// Check client information
		expect(screen.getByText("Test Client")).toBeInTheDocument();
		expect(
			screen.getByText("123 Test Street, Test City, TC 12345")
		).toBeInTheDocument();
		expect(screen.getAllByText("(555) 123-4567").length).toBeGreaterThan(0);
		expect(screen.getByText("test@example.com")).toBeInTheDocument();

		// Check line items
		expect(screen.getByText("Custom Cabinet Installation")).toBeInTheDocument();
		expect(screen.getByText("Hardwood Flooring")).toBeInTheDocument();

		// Check totals - only total (no tax)
		expect(screen.getByText("₹2,500.00")).toBeInTheDocument(); // total

		// Check notes
		expect(
			screen.getByText(
				"Payment due within 30 days. Need repairs, upgrades, or custom work in the future? RAM Carpenters is just a call away"
			)
		).toBeInTheDocument();
	});

	it("renders with custom business information", () => {
		const customBusinessInfo = {
			name: "Custom Carpentry Co.",
			address: "456 Custom Ave, Custom City, CC 67890",
			phone: "(555) 987-6543",
			email: "info@customcarpentry.com",
		};

		render(
			<InvoiceTemplate
				invoice={mockInvoice}
				businessInfo={customBusinessInfo}
			/>
		);

		expect(screen.getAllByText("Custom Carpentry Co.").length).toBeGreaterThan(
			0
		);
		expect(
			screen.getByText("456 Custom Ave, Custom City, CC 67890")
		).toBeInTheDocument();
		expect(screen.getByText("(555) 987-6543")).toBeInTheDocument();
		expect(screen.getByText("info@customcarpentry.com")).toBeInTheDocument();
	});

	it("handles invoice without tax", () => {
		const invoiceWithoutTax = {
			...mockInvoice,
			tax: 0,
			total: 2500,
		};

		render(<InvoiceTemplate invoice={invoiceWithoutTax} />);

		// Total should be displayed (tax is never shown now)
		expect(screen.getByText("₹2,500.00")).toBeInTheDocument();
	});

	it("handles invoice without notes", () => {
		const invoiceWithoutNotes = {
			...mockInvoice,
			notes: "",
		};

		render(<InvoiceTemplate invoice={invoiceWithoutNotes} />);

		// Notes section should not be visible
		const notesHeader = screen.queryByText("Notes / Payment Terms");
		expect(notesHeader).not.toBeInTheDocument();
	});

	it("displays no stamp functionality", () => {
		render(<InvoiceTemplate invoice={mockInvoice} />);

		// No stamp functionality should be present
		expect(screen.getByText("Authorized Signatory")).toBeInTheDocument();
		expect(
			screen.getAllByText("Ram Carpenter Services").length
		).toBeGreaterThan(0);
	});

	it("does not use any stamp from invoice data", () => {
		const invoiceWithStamp = {
			...mockInvoice,
			stamp:
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
		};

		render(<InvoiceTemplate invoice={invoiceWithStamp} />);

		// No stamp image should be used
		const stampImage = screen.queryByAltText("Business Stamp");
		expect(stampImage).not.toBeInTheDocument();
		const authorityStamp = screen.queryByAltText("Authority stamp");
		expect(authorityStamp).not.toBeInTheDocument();
	});
});
