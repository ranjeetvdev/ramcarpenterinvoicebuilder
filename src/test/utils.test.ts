import { describe, it, expect } from "vitest";
import {
	generateId,
	formatDate,
	formatCurrency,
	numberToWords,
} from "../utils";

describe("Utility Functions", () => {
	describe("generateId", () => {
		it("generates unique IDs", () => {
			const id1 = generateId();
			const id2 = generateId();
			expect(id1).not.toBe(id2);
			expect(typeof id1).toBe("string");
			expect(id1.length).toBeGreaterThan(0);
		});
	});

	describe("formatDate", () => {
		it("formats timestamp to readable date in DD/MM/YYYY format", () => {
			const timestamp = new Date("2023-12-18").getTime();
			const formatted = formatDate(timestamp);
			expect(formatted).toBe("18/12/2023");
		});
	});

	describe("formatCurrency", () => {
		it("formats numbers as INR currency", () => {
			expect(formatCurrency(100)).toBe("₹100.00");
			expect(formatCurrency(1234.56)).toBe("₹1,234.56");
			expect(formatCurrency(0)).toBe("₹0.00");
		});
	});

	describe("numberToWords", () => {
		it("converts numbers to words in Indian format", () => {
			expect(numberToWords(0)).toBe("Zero Rupees Only");
			expect(numberToWords(100)).toBe("One Hundred Rupees Only");
			expect(numberToWords(1234)).toBe(
				"One Thousand Two Hundred Thirty Four Rupees Only"
			);
			expect(numberToWords(100000)).toBe("One Lakh Rupees Only");
			expect(numberToWords(10000000)).toBe("One Crore Rupees Only");
			expect(numberToWords(1234.56)).toBe(
				"One Thousand Two Hundred Thirty Four Rupees and Fifty Six Paisa Only"
			);
		});
	});
});
