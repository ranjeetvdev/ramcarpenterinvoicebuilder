import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
	closeOnOverlayClick?: boolean;
	closeOnEscape?: boolean;
}

const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
	closeOnOverlayClick = true,
	closeOnEscape = true,
}) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const previousActiveElement = useRef<HTMLElement | null>(null);

	const sizeClasses = {
		sm: "max-w-md",
		md: "max-w-lg",
		lg: "max-w-2xl",
		xl: "max-w-4xl",
	};

	useEffect(() => {
		if (isOpen) {
			// Store the previously focused element
			previousActiveElement.current = document.activeElement as HTMLElement;

			// Focus the modal
			modalRef.current?.focus();

			// Prevent body scroll
			document.body.style.overflow = "hidden";
		} else {
			// Restore body scroll
			document.body.style.overflow = "";

			// Restore focus to previously focused element
			if (previousActiveElement.current) {
				previousActiveElement.current.focus();
			}
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (closeOnEscape && event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, closeOnEscape, onClose]);

	const handleOverlayClick = (event: React.MouseEvent) => {
		if (closeOnOverlayClick && event.target === event.currentTarget) {
			onClose();
		}
	};

	if (!isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 overflow-y-auto"
			aria-labelledby={title ? "modal-title" : undefined}
			aria-modal="true"
			role="dialog"
		>
			<div
				className="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
				onClick={handleOverlayClick}
			>
				<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

				<div
					ref={modalRef}
					className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full ${sizeClasses[size]}`}
					tabIndex={-1}
				>
					{title && (
						<div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
							<div className="flex items-center justify-between">
								<h3
									id="modal-title"
									className="text-lg font-medium leading-6 text-gray-900"
								>
									{title}
								</h3>
								<button
									type="button"
									className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
									onClick={onClose}
									aria-label="Close modal"
								>
									<svg
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="1.5"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						</div>
					)}

					<div className={title ? "px-4 pb-4 sm:p-6 sm:pt-0" : "p-6"}>
						{children}
					</div>
				</div>
			</div>
		</div>,
		document.body
	);
};

export default Modal;
