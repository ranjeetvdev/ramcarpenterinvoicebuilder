import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const location = useLocation();

	const isActiveLink = (path: string) => {
		if (path === "/" && location.pathname === "/") return true;
		if (path !== "/" && location.pathname.startsWith(path)) return true;
		return false;
	};

	const navLinkClass = (path: string) => {
		const baseClass =
			"px-3 py-2 rounded-md text-sm font-medium transition-colors";
		const activeClass = "bg-blue-100 text-blue-700";
		const inactiveClass = "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

		return `${baseClass} ${isActiveLink(path) ? activeClass : inactiveClass}`;
	};

	const mobileNavLinkClass = (path: string) => {
		const baseClass =
			"block px-3 py-2 rounded-md text-base font-medium transition-colors";
		const activeClass = "bg-blue-100 text-blue-700";
		const inactiveClass = "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

		return `${baseClass} ${isActiveLink(path) ? activeClass : inactiveClass}`;
	};

	return (
		<header className="bg-white shadow-sm border-b border-gray-200 relative">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center">
						<Link
							to="/"
							className="text-xl font-bold text-gray-900 hover:text-blue-700 transition-colors"
						>
							Ram Carpenter's Invoice Builder
						</Link>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex space-x-8">
						<Link to="/" className={navLinkClass("/")}>
							Dashboard
						</Link>
						<Link to="/invoices" className={navLinkClass("/invoices")}>
							Invoices
						</Link>
						<Link to="/clients" className={navLinkClass("/clients")}>
							Clients
						</Link>
					</nav>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							aria-label="Toggle mobile menu"
							aria-expanded={isMobileMenuOpen}
							aria-controls="mobile-menu"
						>
							{isMobileMenuOpen ? (
								<svg
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							) : (
								<svg
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>

				{/* Mobile Navigation Menu */}
				{isMobileMenuOpen && (
					<>
						{/* Backdrop */}
						<div
							className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
							onClick={() => setIsMobileMenuOpen(false)}
							aria-hidden="true"
						/>
						{/* Menu */}
						<nav
							id="mobile-menu"
							className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50"
							aria-label="Mobile navigation"
						>
							<div className="px-2 pt-2 pb-3 space-y-1">
								<Link
									to="/"
									className={mobileNavLinkClass("/")}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Dashboard
								</Link>
								<Link
									to="/invoices"
									className={mobileNavLinkClass("/invoices")}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Invoices
								</Link>
								<Link
									to="/clients"
									className={mobileNavLinkClass("/clients")}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Clients
								</Link>
							</div>
						</nav>
					</>
				)}
			</div>
		</header>
	);
}
