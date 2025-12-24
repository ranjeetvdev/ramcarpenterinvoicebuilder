import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";

describe("App", () => {
	it("renders the main heading", () => {
		render(<App />);
		expect(
			screen.getByText("Ram Carpenter's Invoice Builder")
		).toBeInTheDocument();
	});

	it("renders the dashboard page by default", () => {
		render(<App />);
		expect(
			screen.getByRole("heading", { name: "Dashboard" })
		).toBeInTheDocument();
		expect(
			screen.getByText("Welcome to Ram Carpenter's Invoice Builder")
		).toBeInTheDocument();
	});
});
