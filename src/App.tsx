import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout";
import { ErrorBoundary, Loading } from "./components/common";
import { ToastProvider } from "./contexts/ToastContext";
import {
	Dashboard,
	InvoiceListPage,
	InvoiceFormPage,
	ClientListPage,
	ClientFormPage,
	InvoicePreviewPage,
} from "./pages";

function App() {
	return (
		<ErrorBoundary>
			<ToastProvider position="top-right">
				<BrowserRouter>
					<div className="App">
						<Suspense
							fallback={<Loading size="lg" text="Loading application..." />}
						>
							<Routes>
								<Route path="/" element={<Layout />}>
									<Route index element={<Dashboard />} />

									{/* Invoice routes */}
									<Route path="invoices" element={<InvoiceListPage />} />
									<Route path="invoices/new" element={<InvoiceFormPage />} />
									<Route
										path="invoices/edit/:id"
										element={<InvoiceFormPage />}
									/>
									<Route
										path="invoices/preview/:id"
										element={<InvoicePreviewPage />}
									/>

									{/* Client routes */}
									<Route path="clients" element={<ClientListPage />} />
									<Route path="clients/new" element={<ClientFormPage />} />
									<Route path="clients/edit/:id" element={<ClientFormPage />} />

									{/* Catch-all route - redirect to dashboard */}
									<Route path="*" element={<Dashboard />} />
								</Route>
							</Routes>
						</Suspense>
					</div>
				</BrowserRouter>
			</ToastProvider>
		</ErrorBoundary>
	);
}

export default App;
