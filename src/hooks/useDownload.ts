import { useState } from "react";
import jsPDF from "jspdf";
import type { Invoice } from "../types";

export function useDownload() {
	const [isDownloading, setIsDownloading] = useState(false);

	const downloadInvoiceAsPDF = async (
		_element: HTMLElement, // Not used anymore, kept for compatibility
		invoice: Invoice
	) => {
		try {
			setIsDownloading(true);

			// Create PDF with proper text rendering
			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4",
			});

			// Business info
			const businessInfo = {
				name: "Ram Carpenter Services",
				address:
					"Near Pooja Hardware, Datta Mandir Chowk, Viman Nagar, Pune - 411014",
				phone: "(+91) 7348518917",
				email: "ramrv2001@gmail.com",
			};

			// Helper functions
			const formatDate = (timestamp: number) => {
				return new Date(timestamp).toLocaleDateString("en-GB");
			};

			const formatCurrency = (amount: number) => {
				return `₹${amount.toFixed(2)}`;
			};

			const numberToWords = (num: number) => {
				const ones = [
					"",
					"One",
					"Two",
					"Three",
					"Four",
					"Five",
					"Six",
					"Seven",
					"Eight",
					"Nine",
				];
				const tens = [
					"",
					"",
					"Twenty",
					"Thirty",
					"Forty",
					"Fifty",
					"Sixty",
					"Seventy",
					"Eighty",
					"Ninety",
				];
				const teens = [
					"Ten",
					"Eleven",
					"Twelve",
					"Thirteen",
					"Fourteen",
					"Fifteen",
					"Sixteen",
					"Seventeen",
					"Eighteen",
					"Nineteen",
				];

				if (num === 0) return "Zero Rupees Only";

				const convertHundreds = (n: number): string => {
					let result = "";
					if (n >= 100) {
						result += ones[Math.floor(n / 100)] + " Hundred ";
						n %= 100;
					}
					if (n >= 20) {
						result += tens[Math.floor(n / 10)] + " ";
						n %= 10;
					} else if (n >= 10) {
						result += teens[n - 10] + " ";
						return result;
					}
					if (n > 0) {
						result += ones[n] + " ";
					}
					return result;
				};

				let integerPart = Math.floor(num);
				let result = "";

				if (integerPart >= 10000000) {
					// Crores
					result +=
						convertHundreds(Math.floor(integerPart / 10000000)) + "Crore ";
					integerPart %= 10000000;
				}
				if (integerPart >= 100000) {
					// Lakhs
					result += convertHundreds(Math.floor(integerPart / 100000)) + "Lakh ";
					integerPart %= 100000;
				}
				if (integerPart >= 1000) {
					// Thousands
					result +=
						convertHundreds(Math.floor(integerPart / 1000)) + "Thousand ";
					integerPart %= 1000;
				}
				if (integerPart > 0) {
					result += convertHundreds(integerPart);
				}

				return result.trim() + " Rupees Only";
			};

			// Set up fonts and colors
			pdf.setFont("helvetica", "bold");

			// Header - Business Name
			pdf.setFontSize(20);
			pdf.text(businessInfo.name, 20, 25);

			// Invoice Title
			pdf.setFontSize(24);
			pdf.text("INVOICE", 150, 25);

			// Invoice Number
			pdf.setFontSize(12);
			pdf.setFont("helvetica", "normal");
			pdf.text(invoice.invoiceNumber, 150, 35);

			// Business Address
			pdf.setFontSize(9);
			const addressLines = [
				businessInfo.address,
				businessInfo.phone,
				businessInfo.email,
			];

			let yPos = 35;
			addressLines.forEach((line) => {
				pdf.text(line, 20, yPos);
				yPos += 5;
			});

			// Horizontal line
			pdf.setLineWidth(0.5);
			pdf.line(20, 55, 190, 55);

			// Bill To section
			pdf.setFontSize(10);
			pdf.setFont("helvetica", "bold");
			pdf.text("BILL TO", 20, 65);

			pdf.setFont("helvetica", "normal");
			pdf.setFontSize(12);
			pdf.text(invoice.client.name, 20, 75);

			pdf.setFontSize(9);
			const clientLines = [
				invoice.client.address,
				invoice.client.phone,
				invoice.client.email,
			].filter((line) => line && line.trim());

			yPos = 82;
			clientLines.forEach((line) => {
				pdf.text(line, 20, yPos);
				yPos += 5;
			});

			// Issue Date
			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(10);
			pdf.text("ISSUE DATE:", 150, 65);
			pdf.setFont("helvetica", "normal");
			pdf.setFontSize(12);
			pdf.text(formatDate(invoice.issueDate), 150, 75);

			// Table Header
			const tableStartY = 105;
			pdf.setFillColor(47, 55, 71); // Dark gray background
			pdf.rect(20, tableStartY, 170, 8, "F");

			pdf.setTextColor(255, 255, 255); // White text
			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(10);
			pdf.text("#", 25, tableStartY + 5.5);
			pdf.text("Particulars", 35, tableStartY + 5.5);
			pdf.text("Unit Price", 120, tableStartY + 5.5);
			pdf.text("Qty.", 150, tableStartY + 5.5);
			pdf.text("Amount Rs.", 170, tableStartY + 5.5);

			// Table Rows
			pdf.setTextColor(0, 0, 0); // Black text
			pdf.setFont("helvetica", "normal");
			pdf.setFontSize(9);

			let currentY = tableStartY + 15;
			invoice.lineItems.forEach((item, index) => {
				// Alternate row background
				if (index % 2 === 0) {
					pdf.setFillColor(249, 250, 251); // Light gray
					pdf.rect(20, currentY - 4, 170, 8, "F");
				}

				pdf.text((index + 1).toString() + ".", 25, currentY);
				pdf.text(item.description, 35, currentY);
				pdf.text(formatCurrency(item.unitPrice), 120, currentY);
				pdf.text(item.quantity.toString(), 150, currentY);
				pdf.text(formatCurrency(item.total), 170, currentY);

				currentY += 8;
			});

			// Total Section
			const totalY = currentY + 10;
			pdf.setFillColor(47, 55, 71);
			pdf.rect(120, totalY, 70, 8, "F");

			pdf.setTextColor(255, 255, 255);
			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(12);
			pdf.text("Total:", 125, totalY + 5.5);
			pdf.text(formatCurrency(invoice.total), 170, totalY + 5.5);

			// Amount in Words
			pdf.setTextColor(0, 0, 0);
			pdf.setFillColor(249, 250, 251);
			pdf.rect(20, totalY + 15, 170, 12, "F");

			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(9);
			pdf.text("Amount in Words:", 25, totalY + 22);

			pdf.setFont("helvetica", "normal");
			const amountWords = numberToWords(invoice.total);
			pdf.text(amountWords, 25, totalY + 27);

			// Notes section (if exists)
			let notesY = totalY + 40;
			if (invoice.notes && invoice.notes.trim()) {
				pdf.setFont("helvetica", "bold");
				pdf.setFontSize(10);
				pdf.text("NOTES / PAYMENT TERMS", 20, notesY);

				pdf.setFont("helvetica", "normal");
				pdf.setFontSize(9);
				const noteLines = pdf.splitTextToSize(invoice.notes, 170);
				pdf.text(noteLines, 20, notesY + 8);
				notesY += 8 + noteLines.length * 4;
			}

			// Signature section
			const signatureY = Math.max(notesY + 20, 240);

			// Add signature image if available
			try {
				// Note: In a real implementation, you'd need to convert the image to base64
				// For now, we'll just add the signature area
				pdf.setFont("helvetica", "normal");
				pdf.setFontSize(8);
				pdf.text("Owner: Vishwakarma", 140, signatureY);
				pdf.text("Mob: 7348518917", 140, signatureY + 5);

				// Signature line
				pdf.line(140, signatureY + 15, 180, signatureY + 15);
				pdf.text("Authorized Signatory", 140, signatureY + 20);
				pdf.text(businessInfo.name, 140, signatureY + 25);
			} catch (error) {
				console.log("Could not add signature image");
			}

			// Footer
			const footerY = 280;
			pdf.setFontSize(8);
			pdf.setTextColor(100, 100, 100);
			const footerText =
				"Need repairs, upgrades, or custom work in the future? RAM Carpenters is just a call away";
			const footerLines = pdf.splitTextToSize(footerText, 170);
			pdf.text(footerLines, 20, footerY);

			// Generate filename: ClientName_YYYY-MM-DD.pdf
			const currentDate = new Date();
			const dateString = currentDate.toISOString().split("T")[0];
			const clientName = invoice.client.name.replace(/[^a-zA-Z0-9]/g, "_");
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
