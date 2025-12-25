import React from "react";
import type { Invoice } from "../../types";
import { formatDate, formatCurrency, numberToWords } from "../../utils";
import "./InvoiceTemplate.css";

export interface InvoiceTemplateProps {
	invoice: Invoice;
	businessInfo?: {
		name: string;
		address: string;
		phone: string;
		email: string;
	};
}

/**
 * InvoiceTemplate component renders a professional invoice layout
 * suitable for both screen display and printing
 */
const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
	invoice,
	businessInfo = {
		name: "Ram Carpenter Services",
		address:
			"Near Pooja Hardware, Datta Mandir Chowk, Viman Nagar, Pune - 411014",
		phone: `(+91) 7348518917`,
		email: "ramrv2001@gmail.com",
	},
}) => {
	return (
		<div className="invoice-template bg-white p-6 max-w-4xl mx-auto shadow-lg print:shadow-none">
			{/* Header Section with Business Branding */}
			<header className="border-b-2 border-gray-800 pb-4 mb-4">
				<div className="flex justify-between items-start">
					<div className="business-info">
						<h1 className="text-2xl font-bold text-gray-900 mb-1">
							{businessInfo.name}
						</h1>
						<p className="text-xs text-gray-600">{businessInfo.address}</p>
						<p className="text-xs text-gray-600">{businessInfo.phone}</p>
						<p className="text-xs text-gray-600">{businessInfo.email}</p>
					</div>
					<div className="invoice-header text-right">
						<h2 className="text-3xl font-bold text-gray-900 mb-1">INVOICE</h2>
						<p className="text-base font-semibold text-gray-700">
							{invoice.invoiceNumber}
						</p>
					</div>
				</div>
			</header>

			{/* Invoice Details and Client Information */}
			<div className="grid grid-cols-2 gap-6 mb-6">
				{/* Client Information */}
				<div className="client-info">
					<h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">
						Bill To
					</h3>
					<div className="text-gray-900">
						<p className="font-semibold text-base">{invoice.client.name}</p>
						<p className="text-xs">{invoice.client.address}</p>
						<p className="text-xs">{invoice.client.phone}</p>
						<p className="text-xs">{invoice.client.email}</p>
					</div>
				</div>

				{/* Invoice Dates */}
				<div className="invoice-dates text-right">
					<div className="mb-2">
						<span className="text-xs font-semibold text-gray-500 uppercase">
							Issue Date:{" "}
						</span>
						<span className="text-gray-900 font-medium text-sm">
							{formatDate(invoice.issueDate)}
						</span>
					</div>
				</div>
			</div>

			{/* Line Items Table */}
			<div className="line-items mb-6">
				<table className="w-full border-collapse">
					<thead>
						<tr className="bg-gray-800 text-white">
							<th className="text-center py-2 px-3 font-semibold text-sm w-12">
								#
							</th>
							<th className="text-left py-2 px-3 font-semibold text-sm">
								Particulars
							</th>
							<th className="text-right py-2 px-3 font-semibold text-sm w-28">
								Unit Price
							</th>
							<th className="text-right py-2 px-3 font-semibold text-sm w-20">
								Qty.
							</th>
							<th className="text-right py-2 px-3 font-semibold text-sm w-28">
								Amount Rs.
							</th>
						</tr>
					</thead>
					<tbody>
						{invoice.lineItems.map((item, index) => (
							<tr
								key={item.id}
								className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
							>
								<td className="py-2 px-3 text-center text-gray-900 border-b border-gray-200 font-medium text-sm">
									{index + 1}.
								</td>
								<td className="py-2 px-3 text-gray-900 border-b border-gray-200 text-sm">
									{item.description}
								</td>
								<td className="py-2 px-3 text-right text-gray-900 border-b border-gray-200 text-sm">
									{formatCurrency(item.unitPrice)}
								</td>
								<td className="py-2 px-3 text-right text-gray-900 border-b border-gray-200 text-sm">
									{item.quantity}
								</td>
								<td className="py-2 px-3 text-right font-medium text-gray-900 border-b border-gray-200 text-sm">
									{formatCurrency(item.total)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Totals Section */}
			<div className="totals flex justify-end mb-4">
				<div className="w-72">
					<div className="flex justify-between py-2 bg-gray-800 text-white px-3">
						<span className="text-base font-bold">Total:</span>
						<span className="text-lg font-bold">
							{formatCurrency(invoice.total)}
						</span>
					</div>
				</div>
			</div>

			{/* Amount in Words */}
			<div className="amount-in-words mb-4 border border-gray-300 p-3 bg-gray-50">
				<div className="flex items-start">
					<span className="text-xs font-semibold text-gray-700 mr-2 whitespace-nowrap">
						Amount in Words:
					</span>
					<span className="text-xs text-gray-900 font-medium">
						{numberToWords(invoice.total)}
					</span>
				</div>
			</div>

			{/* Notes Section */}
			{invoice.notes && invoice.notes.trim().length > 0 && (
				<div className="notes border-t border-gray-300 pt-4 mb-6">
					<h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">
						Notes / Payment Terms
					</h3>
					<p className="text-gray-700 whitespace-pre-wrap text-sm">
						{invoice.notes}
					</p>
				</div>
			)}

			{/* Authorized Signatory Section */}
			<div className="signatory-section mt-8 mb-6">
				<div className="flex justify-end">
					<div className="authorized-signatory">
						<div className="text-right">
							<div className="mb-3 flex justify-center items-center">
								<img
									src="/RamCarpenterStampWithSignature.png"
									alt="Signature"
									className="size-28"
								/>
							</div>
							<div className="border-b border-gray-400 w-40 mb-1"></div>
							<p className="text-xs text-gray-600 text-center">
								Authorized Signatory
							</p>
							<p className="text-xs text-gray-500 text-center mt-1">
								{businessInfo.name}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="mt-4 pt-3 border-t border-gray-300 text-center text-xs text-gray-500">
				<p>
					Need repairs, upgrades, or custom work in the future? RAM Carpenters
					is just a call away
				</p>
			</footer>
		</div>
	);
};

export default InvoiceTemplate;
