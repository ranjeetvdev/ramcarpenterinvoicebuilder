import React from "react";
import { InvoiceTemplate, PrintableInvoice } from "../components/invoice";
import type { Invoice } from "../types";

// Example invoice data
const exampleInvoice: Invoice = {
	id: "example-invoice-1",
	invoiceNumber: "INV-001",
	clientId: "example-client-1",
	client: {
		id: "example-client-1",
		name: "John Smith",
		address: "456 Oak Street, Springfield, IL 62701",
		phone: "(217) 555-0123",
		email: "john.smith@email.com",
		createdAt: Date.now(),
	},
	lineItems: [
		{
			id: "item-1",
			description: "Kitchen Cabinet Installation",
			quantity: 1,
			unitPrice: 2500,
			total: 2500,
		},
		{
			id: "item-2",
			description: "Custom Shelving Unit",
			quantity: 2,
			unitPrice: 750,
			total: 1500,
		},
		{
			id: "item-3",
			description: "Hardwood Floor Repair",
			quantity: 150,
			unitPrice: 12,
			total: 1800,
		},
	],
	subtotal: 5800,
	tax: 464, // 8% tax
	total: 6264,
	issueDate: Date.now(),
	dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
	notes:
		"Payment due within 30 days. Need repairs, upgrades, or custom work in the future? RAM Carpenters is just a call away",
	status: "issued",
	createdAt: Date.now(),
	updatedAt: Date.now(),
};

/**
 * Example component demonstrating InvoiceTemplate usage
 */
export const InvoiceTemplateExample: React.FC = () => {
	return (
		<div className="p-8">
			<h2 className="text-2xl font-bold mb-6">Invoice Template Example</h2>
			<InvoiceTemplate invoice={exampleInvoice} />
		</div>
	);
};

/**
 * Example component demonstrating PrintableInvoice usage
 */
export const PrintableInvoiceExample: React.FC = () => {
	const handlePrintSuccess = () => {
		console.log("Invoice printed successfully!");
	};

	const handlePrintError = (error: Error) => {
		console.error("Print failed:", error.message);
		alert(`Print failed: ${error.message}`);
	};

	return (
		<div className="p-8">
			<h2 className="text-2xl font-bold mb-6">Printable Invoice Example</h2>
			<PrintableInvoice
				invoice={exampleInvoice}
				onPrintSuccess={handlePrintSuccess}
				onPrintError={handlePrintError}
			/>
		</div>
	);
};

/**
 * Example with custom business information
 */
export const CustomBusinessInvoiceExample: React.FC = () => {
	const customBusinessInfo = {
		name: "Elite Woodworks LLC",
		address: "789 Craftsman Drive, Woodville, CA 95123",
		phone: "(408) 555-0199",
		email: "contact@elitewoodworks.com",
	};

	return (
		<div className="p-8">
			<h2 className="text-2xl font-bold mb-6">Custom Business Info Example</h2>
			<PrintableInvoice
				invoice={exampleInvoice}
				businessInfo={customBusinessInfo}
			/>
		</div>
	);
};

export default {
	InvoiceTemplateExample,
	PrintableInvoiceExample,
	CustomBusinessInvoiceExample,
};
