import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface ToastProps {
	id: string;
	message: string;
	type?: "success" | "error" | "warning" | "info";
	duration?: number;
	onRemove: (id: string) => void;
}

export interface ToastContainerProps {
	toasts: ToastProps[];
	position?:
		| "top-right"
		| "top-left"
		| "bottom-right"
		| "bottom-left"
		| "top-center"
		| "bottom-center";
}

const Toast: React.FC<ToastProps> = ({
	id,
	message,
	type = "info",
	duration = 5000,
	onRemove,
}) => {
	const [isVisible, setIsVisible] = useState(false);
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		// Trigger entrance animation
		const timer = setTimeout(() => setIsVisible(true), 10);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				handleRemove();
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [duration]);

	const handleRemove = () => {
		setIsExiting(true);
		setTimeout(() => {
			onRemove(id);
		}, 300); // Match the transition duration
	};

	const typeStyles = {
		success: {
			bg: "bg-green-50",
			border: "border-green-200",
			text: "text-green-800",
			icon: (
				<svg
					className="h-5 w-5 text-green-400"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		error: {
			bg: "bg-red-50",
			border: "border-red-200",
			text: "text-red-800",
			icon: (
				<svg
					className="h-5 w-5 text-red-400"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		warning: {
			bg: "bg-yellow-50",
			border: "border-yellow-200",
			text: "text-yellow-800",
			icon: (
				<svg
					className="h-5 w-5 text-yellow-400"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
		info: {
			bg: "bg-blue-50",
			border: "border-blue-200",
			text: "text-blue-800",
			icon: (
				<svg
					className="h-5 w-5 text-blue-400"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clipRule="evenodd"
					/>
				</svg>
			),
		},
	};

	const styles = typeStyles[type];

	return (
		<div
			className={`
        w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${styles.bg} ${
				styles.border
			} border rounded-lg shadow-lg pointer-events-auto
        transform transition-all duration-300 ease-in-out
        ${
					isVisible && !isExiting
						? "translate-x-0 opacity-100"
						: "translate-x-full opacity-0"
				}
      `}
			role="alert"
			aria-live="polite"
		>
			<div className="p-4">
				<div className="flex items-start">
					<div className="flex-shrink-0">{styles.icon}</div>
					<div className="ml-3 w-0 flex-1">
						<p className={`text-sm font-medium ${styles.text} break-words`}>
							{message}
						</p>
					</div>
					<div className="ml-4 flex-shrink-0 flex">
						<button
							className={`rounded-md inline-flex ${styles.text} hover:${styles.text} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${styles.bg} focus:ring-indigo-500`}
							onClick={handleRemove}
							aria-label="Close notification"
						>
							<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

const ToastContainer: React.FC<ToastContainerProps> = ({
	toasts,
	position = "top-right",
}) => {
	const positionClasses = {
		"top-right": "top-0 right-0",
		"top-left": "top-0 left-0",
		"bottom-right": "bottom-0 right-0",
		"bottom-left": "bottom-0 left-0",
		"top-center": "top-0 left-1/2 transform -translate-x-1/2",
		"bottom-center": "bottom-0 left-1/2 transform -translate-x-1/2",
	};

	if (toasts.length === 0) return null;

	return createPortal(
		<div
			className={`fixed z-50 p-4 sm:p-6 space-y-4 ${positionClasses[position]} max-w-full`}
			style={{
				width: position.includes("center")
					? "auto"
					: "min(100vw - 2rem, 28rem)",
			}}
			aria-live="polite"
			aria-label="Notifications"
		>
			{toasts.map((toast) => (
				<Toast key={toast.id} {...toast} />
			))}
		</div>,
		document.body
	);
};

export { Toast, ToastContainer };
export default Toast;
