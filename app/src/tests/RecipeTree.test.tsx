import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeTree } from "../components/RecipeTree";
import type { RecipeBook } from "../types/recipe";

const book: RecipeBook = {
  flour: { name: "Flour" },
  water: { name: "Water" },
  egg: { name: "Egg", states: ["raw", "boiled", "fried"] },
  bread: {
    name: "Bread",
    components: [
      { id: "flour", qty: 500 },
      { id: "water", qty: 300 },
    ],
  },
  "egg-sandwich": {
    name: "Egg Sandwich",
    components: [
      { id: "bread", qty: 2 },
      { id: "egg", qty: 1, state: "fried" },
    ],
  },
};

describe("RecipeTree", () => {
  it("renders an ingredient as a leaf node", () => {
    render(<RecipeTree id="flour" book={book} />);
    expect(screen.getByText("Flour")).toBeInTheDocument();
  });

  it("renders quantity when provided", () => {
    render(<RecipeTree id="flour" book={book} qty={500} />);
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("renders quantity with unit when provided", () => {
    render(<RecipeTree id="flour" book={book} qty={500} unit="g" />);
    expect(screen.getByText("500 g")).toBeInTheDocument();
  });

  it("renders state badge when provided", () => {
    render(<RecipeTree id="egg" book={book} state="fried" />);
    expect(screen.getByText("fried")).toBeInTheDocument();
  });

  it("renders a recipe with its children expanded by default at depth 0", () => {
    render(<RecipeTree id="bread" book={book} />);
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Flour")).toBeInTheDocument();
    expect(screen.getByText("Water")).toBeInTheDocument();
  });

  it("shows missing indicator for unknown id", () => {
    render(<RecipeTree id="unknown-item" book={book} />);
    expect(screen.getByText("unknown-item")).toBeInTheDocument();
    expect(screen.getByText("(missing)")).toBeInTheDocument();
  });

  it("can collapse and expand a recipe node", () => {
    render(<RecipeTree id="bread" book={book} />);

    // Children visible initially
    expect(screen.getByText("Flour")).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(screen.getByText("Bread"));
    expect(screen.queryByText("Flour")).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(screen.getByText("Bread"));
    expect(screen.getByText("Flour")).toBeInTheDocument();
  });

  it("renders nested recipes (egg-sandwich > bread > flour, water)", () => {
    render(<RecipeTree id="egg-sandwich" book={book} />);
    expect(screen.getByText("Egg Sandwich")).toBeInTheDocument();
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Egg")).toBeInTheDocument();
    // Bread's children should also be expanded (depth < 2)
    expect(screen.getByText("Flour")).toBeInTheDocument();
    expect(screen.getByText("Water")).toBeInTheDocument();
  });
});
