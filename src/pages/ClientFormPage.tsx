import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ClientForm } from "../components/client";
import { useClients } from "../hooks/useClients";
import type { Client, ClientData } from "../types";

export default function ClientFormPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { getClient, createClient, updateClient } = useClients();
	const [client, setClient] = useState<Client | null>(null);
	const [loading, setLoading] = useState(false);
	const isEditing = Boolean(id);

	useEffect(() => {
		if (id) {
			const foundClient = getClient(id);
			setClient(foundClient);
		}
	}, [id, getClient]);

	const handleSubmit = async (clientData: ClientData) => {
		setLoading(true);
		try {
			if (isEditing && client) {
				await updateClient({ ...client, ...clientData });
			} else {
				await createClient(clientData);
			}
			navigate("/clients");
		} catch (error) {
			console.error("Error saving client:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		navigate("/clients");
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						{isEditing ? "Edit Client" : "Add New Client"}
					</h1>
					<p className="text-gray-600 mt-2">
						{isEditing ? "Update client information" : "Enter client details"}
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
				<ClientForm
					client={client}
					onSubmit={handleSubmit}
					onCancel={handleCancel}
					loading={loading}
				/>
			</div>
		</div>
	);
}
