import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { InvoiceForm } from "../components/invoice";
import { useInvoices } from "../hooks/useInvoices";
import type { Invoice } from "../types";

export default function InvoiceFormPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { getInvoice, saveInvoice, updateInvoice } = useInvoices();
	const [invoice, setInvoice] = useState<Invoice | null>(null);
	const [loading, setLoading] = useState(false);
	const isEditing = Boolean(id);

	useEffect(() => {
		if (id) {
			const foundInvoice = getInvoice(id);
			setInvoice(foundInvoice);
		}
	}, [id, getInvoice]);

	const handleSubmit = async (invoiceData: Invoice) => {
		setLoading(true);
		try {
			if (isEditing && invoice) {
				await updateInvoice(invoiceData);
			} else {
				await saveInvoice(invoiceData);
			}
			navigate("/invoices");
		} catch (error) {
			console.error("Error saving invoice:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		navigate("/invoices");
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						{isEditing ? "Edit Invoice" : "Create New Invoice"}
					</h1>
					<p className="text-gray-600 mt-2">
						{isEditing
							? "Update invoice details"
							: "Fill in the details to create a new invoice"}
					</p>
				</div>
				<button
					onClick={handleCancel}
					className="text-gray-600 hover:text-gray-800 font-medium"
				>
					Cancel
				</button>
			</div>

			<div className="bg-white rounded-lg shadow">
				<InvoiceForm
					invoice={invoice}
					onSubmit={handleSubmit}
					onCancel={handleCancel}
					loading={loading}
				/>
			</div>
		</div>
	);
}
