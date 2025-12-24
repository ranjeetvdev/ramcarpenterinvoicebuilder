import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { InvoiceTemplate } from "../components/invoice";
import { useInvoices } from "../hooks/useInvoices";
import { usePrint } from "../hooks/usePrint";
import type { Invoice } from "../types";

export default function InvoicePreviewPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { getInvoice } = useInvoices();
	const { printElement, isPrinting } = usePrint();
	const [invoice, setInvoice] = useState<Invoice | null>(null);
	const [loading, setLoading] = useState(true);
	const invoiceRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (id) {
			const foundInvoice = getInvoice(id);
			setInvoice(foundInvoice);
		}
		setLoading(false);
	}, [id, getInvoice]);

	const handlePrint = async () => {
		if (invoice && invoiceRef.current) {
			await printElement(invoiceRef.current);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-64">
				<div className="text-gray-600">Loading invoice...</div>
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="text-center space-y-4">
				<h1 className="text-2xl font-bold text-gray-900">Invoice Not Found</h1>
				<p className="text-gray-600">
					The requested invoice could not be found.
				</p>
				<Link
					to="/invoices"
					className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
				>
					Back to Invoices
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center gap-6 flex-col md:flex-row">
				<div className="w-full">
					<h1 className="text-3xl font-bold text-gray-900">Invoice Preview</h1>
					<p className="mt-2">
						Invoice #{invoice.invoiceNumber} for {invoice.client.name}
					</p>
				</div>
				<div className="flex space-x-3 w-full md:justify-end">
					<Link
						to={`/invoices/edit/${invoice.id}`}
						className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center"
					>
						Edit
					</Link>
					<button
						onClick={handlePrint}
						disabled={isPrinting}
						className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
					>
						{isPrinting ? "Printing..." : "Print"}
					</button>
					<button
						onClick={() => navigate("/invoices")}
						className="text-gray-600 hover:text-gray-800 font-medium"
					>
						Back to List
					</button>
				</div>
			</div>

			<div
				ref={invoiceRef}
				className="bg-white rounded-lg shadow overflow-hidden"
			>
				<InvoiceTemplate invoice={invoice} />
			</div>
		</div>
	);
}
