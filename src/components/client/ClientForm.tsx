import React, { useState, useEffect, useCallback } from "react";
import type { Client, ClientData } from "../../types";
import { validateClient } from "../../types";
import Input from "../common/Input";
import Button from "../common/Button";

export interface ClientFormProps {
	client?: Client | null;
	onSubmit: (clientData: ClientData) => Promise<void>;
	onCancel: () => void;
	loading?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = React.memo(
	({ client, onSubmit, onCancel, loading = false }) => {
		const [formData, setFormData] = useState<ClientData>({
			name: "",
			address: "",
			phone: "",
			email: "",
		});

		const [errors, setErrors] = useState<Record<string, string>>({});
		const [isSubmitting, setIsSubmitting] = useState(false);

		// Initialize form data when client prop changes
		useEffect(() => {
			if (client) {
				setFormData({
					name: client.name,
					address: client.address,
					phone: client.phone,
					email: client.email,
				});
			} else {
				setFormData({
					name: "",
					address: "",
					phone: "",
					email: "",
				});
			}
			setErrors({});
		}, [client]);

		const handleInputChange = useCallback(
			(field: keyof ClientData, value: string) => {
				setFormData((prev) => ({
					...prev,
					[field]: value,
				}));

				// Clear error for this field when user starts typing
				setErrors((prev) => {
					if (prev[field]) {
						const { [field]: _, ...rest } = prev;
						return rest;
					}
					return prev;
				});
			},
			[]
		);

		const handleSubmit = async (e: React.FormEvent) => {
			e.preventDefault();

			// Validate form data
			const validation = validateClient(formData);
			if (!validation.isValid) {
				const fieldErrors: Record<string, string> = {};
				validation.errors.forEach((error) => {
					// Map validation errors to field names
					if (error.toLowerCase().includes("name")) {
						fieldErrors.name = error;
					} else if (error.toLowerCase().includes("address")) {
						fieldErrors.address = error;
					} else if (error.toLowerCase().includes("phone")) {
						fieldErrors.phone = error;
					} else if (error.toLowerCase().includes("email")) {
						fieldErrors.email = error;
					} else {
						fieldErrors.general = error;
					}
				});
				setErrors(fieldErrors);
				return;
			}

			try {
				setIsSubmitting(true);
				setErrors({});
				await onSubmit(formData);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "An error occurred";
				setErrors({ general: errorMessage });
			} finally {
				setIsSubmitting(false);
			}
		};

		const isFormDisabled = loading || isSubmitting;

		return (
			<form onSubmit={handleSubmit} className="space-y-6">
				{errors.general && (
					<div
						className="rounded-md bg-red-50 p-4"
						role="alert"
						aria-live="polite"
					>
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-red-800">
									{errors.general}
								</h3>
							</div>
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
					<div className="sm:col-span-2">
						<Input
							label="Client Name *"
							type="text"
							value={formData.name}
							onChange={(e) => handleInputChange("name", e.target.value)}
							error={errors.name}
							placeholder="Enter client's full name"
							disabled={isFormDisabled}
							required
							maxLength={200}
							autoComplete="name"
						/>
					</div>

					<div className="sm:col-span-2">
						<Input
							label="Address"
							type="text"
							value={formData.address}
							onChange={(e) => handleInputChange("address", e.target.value)}
							error={errors.address}
							placeholder="Enter client's address"
							disabled={isFormDisabled}
							maxLength={500}
							autoComplete="street-address"
						/>
					</div>

					<div>
						<Input
							label="Phone Number"
							type="tel"
							value={formData.phone}
							onChange={(e) => handleInputChange("phone", e.target.value)}
							error={errors.phone}
							placeholder="(555) 123-4567"
							disabled={isFormDisabled}
							autoComplete="tel"
						/>
					</div>

					<div>
						<Input
							label="Email Address"
							type="email"
							value={formData.email}
							onChange={(e) => handleInputChange("email", e.target.value)}
							error={errors.email}
							placeholder="client@example.com"
							disabled={isFormDisabled}
							autoComplete="email"
						/>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
					<Button
						type="button"
						variant="secondary"
						onClick={onCancel}
						disabled={isFormDisabled}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="primary"
						loading={isSubmitting}
						disabled={isFormDisabled}
					>
						{client ? "Update Client" : "Create Client"}
					</Button>
				</div>
			</form>
		);
	}
);

ClientForm.displayName = "ClientForm";

export default ClientForm;
