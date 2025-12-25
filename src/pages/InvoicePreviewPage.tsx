import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { InvoiceTemplate } from "../components/invoice";
import { useInvoices } from "../hooks/useInvoices";
import { useDownload } from "../hooks/useDownload";
import type { Invoice } from "../types";

export default function InvoicePreviewPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { getInvoice } = useInvoices();
	const { downloadInvoiceAsPDF, isDownloading } = useDownload();
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

	const handleDownload = async () => {
		if (invoice && invoiceRef.current) {
			try {
				await downloadInvoiceAsPDF(invoiceRef.current, invoice);
			} catch (error) {
				console.error("Download failed:", error);
				// You could add a toast notification here if needed
			}
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
						onClick={handleDownload}
						disabled={isDownloading}
						className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
					>
						{isDownloading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								<span>Downloading...</span>
							</>
						) : (
							<>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
								<span>Download PDF</span>
							</>
						)}
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
