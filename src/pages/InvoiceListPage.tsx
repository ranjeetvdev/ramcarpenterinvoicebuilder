import { Link, useNavigate } from "react-router-dom";
import { InvoiceList } from "../components/invoice";
import { useInvoices } from "../hooks/useInvoices";
import type { Invoice } from "../types";

export default function InvoiceListPage() {
	const navigate = useNavigate();
	const { invoices, deleteInvoice } = useInvoices();

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
			/>
		</div>
	);
}
