// src/App.test.jsx
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders game title", () => {
  render(<App />);
  expect(screen.getByText(/tic/i)).toBeInTheDocument();
});