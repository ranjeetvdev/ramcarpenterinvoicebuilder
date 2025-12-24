import React, { useRef } from "react";
import InvoiceTemplate, { type InvoiceTemplateProps } from "./InvoiceTemplate";
import Button from "../common/Button";
import { printInvoice } from "../../utils";

export interface PrintableInvoiceProps extends InvoiceTemplateProps {
	showPrintButton?: boolean;
	onPrintSuccess?: () => void;
	onPrintError?: (error: Error) => void;
}

/**
 * PrintableInvoice component wraps InvoiceTemplate with print functionality
 */
const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({
	invoice,
	businessInfo,
	showPrintButton = true,
	onPrintSuccess,
	onPrintError,
}) => {
	const invoiceRef = useRef<HTMLDivElement>(null);

	const handlePrint = async () => {
		if (!invoiceRef.current) {
			const error = new Error("Invoice element not found");
			onPrintError?.(error);
			return;
		}

		try {
			printInvoice(invoiceRef.current);
			onPrintSuccess?.();
		} catch (error) {
			const printError =
				error instanceof Error ? error : new Error("Print failed");
			onPrintError?.(printError);
		}
	};

	return (
		<div className="printable-invoice">
			{/* Print Button - Hidden during print */}
			{showPrintButton && (
				<div className="print-controls mb-6 text-center no-print">
					<Button onClick={handlePrint} variant="primary" className="px-6 py-2">
						🖨️ Print Invoice
					</Button>
				</div>
			)}

			{/* Invoice Template */}
			<div ref={invoiceRef}>
				<InvoiceTemplate invoice={invoice} businessInfo={businessInfo} />
			</div>
		</div>
	);
};

export default PrintableInvoice;
