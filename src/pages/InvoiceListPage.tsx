import { Link, useNavigate } from "react-router-dom";
import { InvoiceList } from "../components/invoice";
import { useInvoices } from "../hooks/useInvoices";
import { useDownload } from "../hooks/useDownload";
import { useRef } from "react";
import type { Invoice } from "../types";

export default function InvoiceListPage() {
	const navigate = useNavigate();
	const { invoices, deleteInvoice } = useInvoices();
	const { downloadInvoiceAsPDF } = useDownload();
	const hiddenInvoiceRef = useRef<HTMLDivElement>(null);

	const handleEdit = (invoice: Invoice) => {
		navigate(`/invoices/edit/${invoice.id}`);
	};

	const handleDelete = async (invoiceId: string) => {
		if (window.confirm("Are you sure you want to delete this invoice?")) {
			await deleteInvoice(invoiceId);
		}
	};

	const handleView = (invoice: Invoice) => {
		navigate(`/invoices/preview/${invoice.id}`);
	};

	const handleDownload = async (invoice: Invoice) => {
		if (!hiddenInvoiceRef.current) return;

		try {
			// Temporarily render the invoice in the hidden container
			const hiddenContainer = hiddenInvoiceRef.current;
			hiddenContainer.innerHTML = "";

			// Create a temporary div to render the invoice
			const tempDiv = document.createElement("div");
			tempDiv.style.position = "absolute";
			tempDiv.style.left = "-9999px";
			tempDiv.style.top = "0";
			tempDiv.style.width = "794px"; // A4 width in pixels at 96 DPI
			tempDiv.style.backgroundColor = "white";

			document.body.appendChild(tempDiv);

			// We need to use React to render the component, but for now let's use a simpler approach
			// Create the invoice HTML structure manually
			const invoiceHTML = `
				<div style="background: white; padding: 24px; max-width: 794px; margin: 0 auto;">
					${await generateInvoiceHTML(invoice)}
				</div>
			`;

			tempDiv.innerHTML = invoiceHTML;

			// Wait a bit for rendering
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Download the PDF
			await downloadInvoiceAsPDF(tempDiv, invoice);

			// Clean up
			document.body.removeChild(tempDiv);
		} catch (error) {
			console.error("Download failed:", error);
		}
	};

	// Helper function to generate invoice HTML
	const generateInvoiceHTML = async (invoice: Invoice) => {
		const businessInfo = {
			name: "Ram Carpenter Services",
			address:
				"Near Pooja Hardware, Datta Mandir Chowk, Viman Nagar, Pune - 411014",
			phone: "(+91) 7348518917",
			email: "ramrv2001@gmail.com",
		};

		const formatDate = (timestamp: number) => {
			return new Date(timestamp).toLocaleDateString();
		};

		const formatCurrency = (amount: number) => {
			return `₹${amount.toFixed(2)}`;
		};

		const numberToWords = (num: number) => {
			// Simple implementation - you might want to use a library for this
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
			const teens = [
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

			if (num === 0) return "Zero Rupees Only";

			const convertHundreds = (n: number): string => {
				let result = "";
				if (n >= 100) {
					result += ones[Math.floor(n / 100)] + " Hundred ";
					n %= 100;
				}
				if (n >= 20) {
					result += tens[Math.floor(n / 10)] + " ";
					n %= 10;
				} else if (n >= 10) {
					result += teens[n - 10] + " ";
					return result;
				}
				if (n > 0) {
					result += ones[n] + " ";
				}
				return result;
			};

			const integerPart = Math.floor(num);
			return convertHundreds(integerPart).trim() + " Rupees Only";
		};

		return `
			<!-- Header Section -->
			<div style="border-bottom: 2px solid #1f2937; padding-bottom: 16px; margin-bottom: 16px;">
				<div style="display: flex; justify-content: space-between; align-items: flex-start;">
					<div>
						<h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 4px;">${
							businessInfo.name
						}</h1>
						<p style="font-size: 12px; color: #4b5563; margin: 0;">${
							businessInfo.address
						}</p>
						<p style="font-size: 12px; color: #4b5563; margin: 0;">${businessInfo.phone}</p>
						<p style="font-size: 12px; color: #4b5563; margin: 0;">${businessInfo.email}</p>
					</div>
					<div style="text-align: right;">
						<h2 style="font-size: 32px; font-weight: bold; color: #1f2937; margin-bottom: 4px;">INVOICE</h2>
						<p style="font-size: 16px; font-weight: 600; color: #374151; margin: 0;">${
							invoice.invoiceNumber
						}</p>
					</div>
				</div>
			</div>

			<!-- Client and Date Info -->
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
				<div>
					<h3 style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Bill To</h3>
					<p style="font-weight: 600; font-size: 16px; color: #1f2937; margin: 0;">${
						invoice.client.name
					}</p>
					<p style="font-size: 12px; color: #1f2937; margin: 0;">${
						invoice.client.address
					}</p>
					<p style="font-size: 12px; color: #1f2937; margin: 0;">${
						invoice.client.phone
					}</p>
					<p style="font-size: 12px; color: #1f2937; margin: 0;">${
						invoice.client.email
					}</p>
				</div>
				<div style="text-align: right;">
					<div style="margin-bottom: 8px;">
						<span style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Issue Date: </span>
						<span style="color: #1f2937; font-weight: 500; font-size: 14px;">${formatDate(
							invoice.issueDate
						)}</span>
					</div>
				</div>
			</div>

			<!-- Line Items Table -->
			<div style="margin-bottom: 24px;">
				<table style="width: 100%; border-collapse: collapse;">
					<thead>
						<tr style="background-color: #1f2937; color: white;">
							<th style="text-align: center; padding: 8px 12px; font-weight: 600; font-size: 14px; width: 48px;">#</th>
							<th style="text-align: left; padding: 8px 12px; font-weight: 600; font-size: 14px;">Particulars</th>
							<th style="text-align: right; padding: 8px 12px; font-weight: 600; font-size: 14px; width: 112px;">Unit Price</th>
							<th style="text-align: right; padding: 8px 12px; font-weight: 600; font-size: 14px; width: 80px;">Qty.</th>
							<th style="text-align: right; padding: 8px 12px; font-weight: 600; font-size: 14px; width: 112px;">Amount Rs.</th>
						</tr>
					</thead>
					<tbody>
						${invoice.lineItems
							.map(
								(item, index) => `
							<tr style="background-color: ${index % 2 === 0 ? "#f9fafb" : "white"};">
								<td style="padding: 8px 12px; text-align: center; color: #1f2937; border-bottom: 1px solid #e5e7eb; font-weight: 500; font-size: 14px;">${
									index + 1
								}.</td>
								<td style="padding: 8px 12px; color: #1f2937; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${
									item.description
								}</td>
								<td style="padding: 8px 12px; text-align: right; color: #1f2937; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${formatCurrency(
									item.unitPrice
								)}</td>
								<td style="padding: 8px 12px; text-align: right; color: #1f2937; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${
									item.quantity
								}</td>
								<td style="padding: 8px 12px; text-align: right; font-weight: 500; color: #1f2937; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${formatCurrency(
									item.total
								)}</td>
							</tr>
						`
							)
							.join("")}
					</tbody>
				</table>
			</div>

			<!-- Totals -->
			<div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
				<div style="width: 288px;">
					<div style="display: flex; justify-content: space-between; padding: 8px 12px; background-color: #1f2937; color: white;">
						<span style="font-size: 16px; font-weight: bold;">Total:</span>
						<span style="font-size: 18px; font-weight: bold;">${formatCurrency(
							invoice.total
						)}</span>
					</div>
				</div>
			</div>

			<!-- Amount in Words -->
			<div style="margin-bottom: 16px; border: 1px solid #d1d5db; padding: 12px; background-color: #f9fafb;">
				<div style="display: flex; align-items: flex-start;">
					<span style="font-size: 12px; font-weight: 600; color: #374151; margin-right: 8px; white-space: nowrap;">Amount in Words:</span>
					<span style="font-size: 12px; color: #1f2937; font-weight: 500;">${numberToWords(
						invoice.total
					)}</span>
				</div>
			</div>

			${
				invoice.notes && invoice.notes.trim().length > 0
					? `
			<!-- Notes -->
			<div style="border-top: 1px solid #d1d5db; padding-top: 16px; margin-bottom: 24px;">
				<h3 style="font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 4px;">Notes / Payment Terms</h3>
				<p style="color: #374151; white-space: pre-wrap; font-size: 14px; margin: 0;">${invoice.notes}</p>
			</div>
			`
					: ""
			}

			<!-- Signature -->
			<div style="margin-top: 32px; margin-bottom: 24px;">
				<div style="display: flex; justify-content: flex-end;">
					<div style="text-align: right;">
						<div style="margin-bottom: 12px; display: flex; justify-content: center; align-items: center;">
							<img src="/RamCarpenterStampWithSignature.png" alt="Signature" style="width: 112px; height: 112px;" />
						</div>
						<div style="border-bottom: 1px solid #9ca3af; width: 160px; margin-bottom: 4px;"></div>
						<p style="font-size: 12px; color: #4b5563; text-align: center; margin: 0;">Authorized Signatory</p>
						<p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 4px; margin-bottom: 0;">${
							businessInfo.name
						}</p>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #d1d5db; text-align: center; font-size: 12px; color: #6b7280;">
				<p style="margin: 0;">Need repairs, upgrades, or custom work in the future? RAM Carpenters is just a call away</p>
			</div>
		`;
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
				<div className="text-center sm:text-left">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
						Invoices
					</h1>
					<p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
						Manage all your invoices
					</p>
				</div>
				<Link
					to="/invoices/new"
					className="bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-center text-sm sm:text-base whitespace-nowrap"
				>
					<span className="hidden sm:inline">Create New Invoice</span>
					<span className="sm:hidden">New Invoice</span>
				</Link>
			</div>

			<InvoiceList
				invoices={invoices}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onView={handleView}
				onDownload={handleDownload}
			/>

			{/* Hidden container for PDF generation */}
			<div
				ref={hiddenInvoiceRef}
				style={{ position: "absolute", left: "-9999px", top: "0" }}
			/>
		</div>
	);
}
