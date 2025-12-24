import { Link } from "react-router-dom";

export default function Dashboard() {
	return (
		<div className="space-y-6 sm:space-y-8">
			<div className="text-center sm:text-left">
				<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
					Dashboard
				</h1>
				<p className="text-gray-600 mt-2 text-sm sm:text-base">
					Welcome to Ram Carpenter's Invoice Builder
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
				{/* Quick Actions */}
				<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 border border-gray-100">
					<h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
						<svg
							className="h-5 w-5 mr-2 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Quick Actions
					</h2>
					<div className="space-y-3">
						<Link
							to="/invoices/new"
							className="block w-full bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-center text-sm sm:text-base"
						>
							Create New Invoice
						</Link>
						<Link
							to="/clients/new"
							className="block w-full bg-green-600 hover:bg-green-700 focus:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-center text-sm sm:text-base"
						>
							Add New Client
						</Link>
					</div>
				</div>

				{/* Navigation */}
				<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 border border-gray-100">
					<h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
						<svg
							className="h-5 w-5 mr-2 text-gray-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
						Manage
					</h2>
					<div className="space-y-3">
						<Link
							to="/invoices"
							className="block w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 focus:border-blue-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-all text-center text-sm sm:text-base"
						>
							View All Invoices
						</Link>
						<Link
							to="/clients"
							className="block w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 focus:border-blue-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-all text-center text-sm sm:text-base"
						>
							View All Clients
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
