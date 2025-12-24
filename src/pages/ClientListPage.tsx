import { Link, useNavigate } from "react-router-dom";
import { ClientList } from "../components/client";
import { useClients } from "../hooks/useClients";
import type { Client } from "../types";

export default function ClientListPage() {
	const navigate = useNavigate();
	const { clients, deleteClient } = useClients();

	const handleEdit = (client: Client) => {
		navigate(`/clients/edit/${client.id}`);
	};

	const handleDelete = async (clientId: string) => {
		if (window.confirm("Are you sure you want to delete this client?")) {
			await deleteClient(clientId);
		}
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
				<div className="text-center sm:text-left">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
						Clients
					</h1>
					<p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
						Manage your client information
					</p>
				</div>
				<Link
					to="/clients/new"
					className="bg-green-600 hover:bg-green-700 focus:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-center text-sm sm:text-base whitespace-nowrap"
				>
					<span className="hidden sm:inline">Add New Client</span>
					<span className="sm:hidden">New Client</span>
				</Link>
			</div>

			<ClientList
				clients={clients}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</div>
	);
}
