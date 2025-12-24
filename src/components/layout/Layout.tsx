import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<Header />
			<main
				className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8"
				role="main"
				aria-label="Main content"
			>
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="bg-white border-t border-gray-200 mt-auto">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="text-center text-sm text-gray-500">
						© {new Date().getFullYear()} Ram Carpenter's Invoice Builder. Built
						for professional carpentry services.
					</div>
				</div>
			</footer>
		</div>
	);
}
