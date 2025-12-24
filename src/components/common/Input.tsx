import React, { forwardRef } from "react";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	variant?: "default" | "filled" | "outlined";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			error,
			helperText,
			leftIcon,
			rightIcon,
			className = "",
			variant = "default",
			id,
			...props
		},
		ref
	) => {
		const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

		const getVariantClasses = () => {
			const baseClasses =
				"block w-full transition-all duration-200 ease-in-out";

			switch (variant) {
				case "filled":
					return `${baseClasses} rounded-lg bg-gray-50 border-0 px-4 py-3 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`;
				case "outlined":
					return `${baseClasses} rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-0 hover:border-gray-300 disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed`;
				default:
					return `${baseClasses} rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`;
			}
		};

		const getErrorClasses = () => {
			switch (variant) {
				case "filled":
					return "bg-red-50 focus:bg-red-50 focus:ring-red-500 text-red-900 placeholder-red-400 hover:bg-red-100";
				case "outlined":
					return "border-red-300 focus:border-red-500 text-red-900 placeholder-red-400";
				default:
					return "border-red-300 focus:border-red-500 focus:ring-red-500 focus:ring-opacity-20 text-red-900 placeholder-red-400";
			}
		};

		const inputClasses = error
			? `${getVariantClasses()} ${getErrorClasses()}`
			: getVariantClasses();

		const paddingClasses =
			leftIcon && rightIcon
				? "pl-12 pr-12"
				: leftIcon
				? "pl-12"
				: rightIcon
				? "pr-12"
				: "";

		return (
			<div className={className}>
				{label && (
					<label
						htmlFor={inputId}
						className="block text-sm font-semibold text-gray-700 mb-2"
					>
						{label}
					</label>
				)}

				<div className="relative">
					{leftIcon && (
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<div className="h-5 w-5 text-gray-400" aria-hidden="true">
								{leftIcon}
							</div>
						</div>
					)}

					<input
						ref={ref}
						id={inputId}
						className={`${inputClasses} ${paddingClasses}`}
						aria-invalid={error ? "true" : "false"}
						aria-describedby={
							error
								? `${inputId}-error`
								: helperText
								? `${inputId}-helper`
								: undefined
						}
						{...props}
					/>

					{rightIcon && (
						<div className="absolute inset-y-0 right-0 pr-4 flex items-center">
							<div className="h-5 w-5 text-gray-400" aria-hidden="true">
								{rightIcon}
							</div>
						</div>
					)}
				</div>

				{error && (
					<p
						id={`${inputId}-error`}
						className="mt-2 text-sm text-red-600 flex items-center"
						role="alert"
					>
						<svg
							className="h-4 w-4 mr-1 flex-shrink-0"
							fill="currentColor"
							viewBox="0 0 20 20"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
								clipRule="evenodd"
							/>
						</svg>
						{error}
					</p>
				)}

				{helperText && !error && (
					<p id={`${inputId}-helper`} className="mt-2 text-sm text-gray-500">
						{helperText}
					</p>
				)}
			</div>
		);
	}
);

Input.displayName = "Input";

export default Input;
