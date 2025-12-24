import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer, type ToastProps } from "../components/common/Toast";

interface ToastContextType {
	showToast: (
		message: string,
		type?: ToastProps["type"],
		duration?: number
	) => void;
	showSuccess: (message: string, duration?: number) => void;
	showError: (message: string, duration?: number) => void;
	showWarning: (message: string, duration?: number) => void;
	showInfo: (message: string, duration?: number) => void;
	removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
};

interface ToastProviderProps {
	children: React.ReactNode;
	position?:
		| "top-right"
		| "top-left"
		| "bottom-right"
		| "bottom-left"
		| "top-center"
		| "bottom-center";
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
	children,
	position = "top-right",
}) => {
	const [toasts, setToasts] = useState<ToastProps[]>([]);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const showToast = useCallback(
		(message: string, type: ToastProps["type"] = "info", duration = 5000) => {
			const id = `toast-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`;
			const newToast: ToastProps = {
				id,
				message,
				type,
				duration,
				onRemove: removeToast,
			};

			setToasts((prev) => [...prev, newToast]);
		},
		[removeToast]
	);

	const showSuccess = useCallback(
		(message: string, duration = 5000) => {
			showToast(message, "success", duration);
		},
		[showToast]
	);

	const showError = useCallback(
		(message: string, duration = 7000) => {
			showToast(message, "error", duration);
		},
		[showToast]
	);

	const showWarning = useCallback(
		(message: string, duration = 6000) => {
			showToast(message, "warning", duration);
		},
		[showToast]
	);

	const showInfo = useCallback(
		(message: string, duration = 5000) => {
			showToast(message, "info", duration);
		},
		[showToast]
	);

	const contextValue: ToastContextType = {
		showToast,
		showSuccess,
		showError,
		showWarning,
		showInfo,
		removeToast,
	};

	return (
		<ToastContext.Provider value={contextValue}>
			{children}
			<ToastContainer toasts={toasts} position={position} />
		</ToastContext.Provider>
	);
};

export default ToastProvider;
