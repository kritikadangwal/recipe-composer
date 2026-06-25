import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlatList } from "../components/FlatList";
import type { FlatIngredient } from "../types/recipe";

describe("FlatList", () => {
  it("shows empty message when items is empty", () => {
    render(<FlatList items={[]} />);
    expect(screen.getByText("No ingredients resolved.")).toBeInTheDocument();
  });

  it("renders ingredient name and quantity without unit", () => {
    const items: FlatIngredient[] = [
      { id: "salt", name: "Salt", quantities: [{ qty: 5 }] },
    ];
    render(<FlatList items={items} />);
    expect(screen.getByText("Salt")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders quantity with unit", () => {
    const items: FlatIngredient[] = [
      { id: "flour", name: "Flour", quantities: [{ qty: 500, unit: "g" }] },
    ];
    render(<FlatList items={items} />);
    expect(screen.getByText("500 g")).toBeInTheDocument();
  });

  it("renders multi-unit quantities joined with +", () => {
    const items: FlatIngredient[] = [
      {
        id: "water",
        name: "Water",
        quantities: [
          { qty: 600, unit: "ml" },
          { qty: 1, unit: "cup" },
        ],
      },
    ];
    render(<FlatList items={items} />);
    expect(screen.getByText("600 ml + 1 cup")).toBeInTheDocument();
  });

  it("renders state badge when present", () => {
    const items: FlatIngredient[] = [
      { id: "egg", name: "Egg", quantities: [{ qty: 2 }], state: "fried" },
    ];
    render(<FlatList items={items} />);
    expect(screen.getByText("fried")).toBeInTheDocument();
  });

  it("renders multiple ingredients", () => {
    const items: FlatIngredient[] = [
      { id: "flour", name: "Flour", quantities: [{ qty: 500, unit: "g" }] },
      { id: "water", name: "Water", quantities: [{ qty: 300, unit: "ml" }] },
      { id: "egg", name: "Egg", quantities: [{ qty: 1 }], state: "boiled" },
    ];
    render(<FlatList items={items} />);
    expect(screen.getByText("Flour")).toBeInTheDocument();
    expect(screen.getByText("Water")).toBeInTheDocument();
    expect(screen.getByText("Egg")).toBeInTheDocument();
  });
});
