import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Invoice } from "../types";

export function useDownload() {
	const [isDownloading, setIsDownloading] = useState(false);

	const downloadInvoiceAsPDF = async (
		element: HTMLElement,
		invoice: Invoice
	) => {
		try {
			setIsDownloading(true);

			// Generate canvas from HTML element
			const canvas = await html2canvas(element, {
				scale: 2, // Higher quality
				useCORS: true,
				allowTaint: true,
				backgroundColor: "#ffffff",
				logging: false,
			});

			// Create PDF
			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4",
			});

			// Calculate dimensions to fit A4
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();
			const imgWidth = canvas.width;
			const imgHeight = canvas.height;
			const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
			const imgX = (pdfWidth - imgWidth * ratio) / 2;
			const imgY = 0;

			pdf.addImage(
				imgData,
				"PNG",
				imgX,
				imgY,
				imgWidth * ratio,
				imgHeight * ratio
			);

			// Generate filename: ClientName_YYYY-MM-DD.pdf
			const currentDate = new Date();
			const dateString = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD format
			const clientName = invoice.client.name.replace(/[^a-zA-Z0-9]/g, "_"); // Replace special chars with underscore
			const filename = `${clientName}_${dateString}.pdf`;

			// Download the PDF
			pdf.save(filename);
		} catch (error) {
			console.error("Error generating PDF:", error);
			throw new Error("Failed to download invoice. Please try again.");
		} finally {
			setIsDownloading(false);
		}
	};

	return {
		downloadInvoiceAsPDF,
		isDownloading,
	};
}
