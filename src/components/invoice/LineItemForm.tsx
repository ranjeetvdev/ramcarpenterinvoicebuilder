import React, { useState, useCallback } from "react";
import type { LineItem } from "../../types";
import { validateLineItem } from "../../types";
import { calculateLineItemTotal } from "../../utils";
import { Button, Input } from "../common";

export interface LineItemFormProps {
	onAdd: (lineItem: Omit<LineItem, "id">) => void;
	onCancel?: () => void;
	initialData?: Partial<LineItem>;
	submitLabel?: string;
	className?: string;
}

const LineItemForm: React.FC<LineItemFormProps> = ({
	onAdd,
	onCancel,
	initialData,
	submitLabel = "Add Line Item",
	className = "",
}) => {
	const [formData, setFormData] = useState({
		description: initialData?.description || "",
		quantity: initialData?.quantity || 1,
		unitPrice: initialData?.unitPrice || 0,
		unit: initialData?.unit || "",
		totalQuantity: initialData?.totalQuantity || undefined,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const calculateTotal = useCallback(
		(quantity: number, unitPrice: number, totalQuantity?: number) => {
			return calculateLineItemTotal(quantity, unitPrice, totalQuantity);
		},
		[]
	);

	const total = calculateTotal(
		formData.quantity,
		formData.unitPrice,
		formData.totalQuantity
	);

	const handleInputChange = useCallback(
		(field: keyof typeof formData) => {
			return (e: React.ChangeEvent<HTMLInputElement>) => {
				let value: string | number | undefined;

				if (field === "description" || field === "unit") {
					value = e.target.value;
				} else if (field === "totalQuantity") {
					// Handle totalQuantity as optional number
					const numValue = parseFloat(e.target.value);
					value = e.target.value === "" ? undefined : numValue || 0;
				} else {
					value = parseFloat(e.target.value) || 0;
				}

				setFormData((prev) => ({
					...prev,
					[field]: value,
				}));

				// Clear error for this field when user starts typing
				if (errors[field]) {
					setErrors((prev) => ({
						...prev,
						[field]: "",
					}));
				}
			};
		},
		[errors]
	);

	const handleSubmit = useCallback(async () => {
		setIsSubmitting(true);

		const lineItemData = {
			...formData,
			// Handle empty unit field gracefully
			unit: formData.unit.trim() === "" ? undefined : formData.unit,
			// totalQuantity is already undefined if empty
			total: calculateTotal(
				formData.quantity,
				formData.unitPrice,
				formData.totalQuantity
			),
		};

		// Validate the line item
		const validation = validateLineItem(lineItemData);

		if (!validation.isValid) {
			const fieldErrors: Record<string, string> = {};
			validation.errors.forEach((error) => {
				if (error.includes("Description")) {
					fieldErrors.description = error;
				} else if (error.includes("Quantity")) {
					fieldErrors.quantity = error;
				} else if (error.includes("Rate")) {
					fieldErrors.unitPrice = error;
				} else if (error.includes("Unit")) {
					fieldErrors.unit = error;
				} else if (error.includes("Total quantity")) {
					fieldErrors.totalQuantity = error;
				} else {
					fieldErrors.general = error;
				}
			});
			setErrors(fieldErrors);
			setIsSubmitting(false);
			return;
		}

		try {
			onAdd(lineItemData);

			// Reset form after successful submission
			setFormData({
				description: "",
				quantity: 1,
				unitPrice: 0,
				unit: "",
				totalQuantity: undefined,
			});
			setErrors({});
		} catch (error) {
			setErrors({ general: "Failed to add line item. Please try again." });
		} finally {
			setIsSubmitting(false);
		}
	}, [formData, calculateTotal, onAdd]);

	const handleReset = useCallback(() => {
		setFormData({
			description: "",
			quantity: 1,
			unitPrice: 0,
			unit: "",
			totalQuantity: undefined,
		});
		setErrors({});
	}, []);

	return (
		<div className={`space-y-4 ${className}`}>
			{errors.general && (
				<div className="bg-red-50 border border-red-200 rounded-md p-3">
					<p className="text-sm text-red-600">{errors.general}</p>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<div className="md:col-span-2">
					<Input
						label="Description"
						type="text"
						value={formData.description}
						onChange={handleInputChange("description")}
						error={errors.description}
						placeholder="Enter service or product description"
					/>
				</div>

				<div>
					<Input
						label="Quantity"
						type="number"
						value={formData.quantity.toString()}
						onChange={handleInputChange("quantity")}
						error={errors.quantity}
						min="0.01"
						step="0.01"
					/>
				</div>

				<div>
					<Input
						label="Rate (₹)"
						type="number"
						value={formData.unitPrice.toString()}
						onChange={handleInputChange("unitPrice")}
						error={errors.unitPrice}
						min="0"
						step="0.01"
					/>
				</div>

				<div>
					<Input
						label="Per (unit)"
						type="text"
						value={formData.unit}
						onChange={handleInputChange("unit")}
						error={errors.unit}
						placeholder="sq ft, ft, NO, piece"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div>
					<Input
						label="Total Quantity (optional)"
						type="number"
						value={formData.totalQuantity?.toString() || ""}
						onChange={handleInputChange("totalQuantity")}
						error={errors.totalQuantity}
						min="0.01"
						step="0.01"
						placeholder="Additional quantity tracking"
					/>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<div className="text-sm text-gray-600">
					<span className="font-medium">Total: </span>
					<span className="text-lg font-semibold text-gray-900">
						₹{total.toFixed(2)}
					</span>
				</div>

				<div className="flex space-x-3">
					{onCancel && (
						<Button
							type="button"
							variant="ghost"
							onClick={onCancel}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
					)}

					<Button
						type="button"
						variant="secondary"
						onClick={handleReset}
						disabled={isSubmitting}
					>
						Reset
					</Button>

					<Button
						type="button"
						variant="primary"
						loading={isSubmitting}
						disabled={!formData.description.trim() || formData.quantity <= 0}
						onClick={handleSubmit}
					>
						{submitLabel}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default LineItemForm;
