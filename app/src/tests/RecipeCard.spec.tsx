import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeCard } from "../components/RecipeCard";
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
};

const noop = vi.fn();

describe("RecipeCard", () => {
  it("renders ingredient with name and badge", () => {
    render(
      <RecipeCard
        id="flour"
        entry={book.flour}
        book={book}
        onSelect={noop}
        onEdit={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText("Flour")).toBeInTheDocument();
    expect(screen.getByText("Ingredient")).toBeInTheDocument();
  });

  it("renders recipe with badge and component count", () => {
    render(
      <RecipeCard
        id="bread"
        entry={book.bread}
        book={book}
        onSelect={noop}
        onEdit={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Recipe")).toBeInTheDocument();
    expect(screen.getByText(/2 components/)).toBeInTheDocument();
  });

  it("shows component names in recipe meta", () => {
    render(
      <RecipeCard
        id="bread"
        entry={book.bread}
        book={book}
        onSelect={noop}
        onEdit={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText(/Flour, Water/)).toBeInTheDocument();
  });

  it("shows state pills for ingredients with states", () => {
    render(
      <RecipeCard
        id="egg"
        entry={book.egg}
        book={book}
        onSelect={noop}
        onEdit={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText("raw")).toBeInTheDocument();
    expect(screen.getByText("boiled")).toBeInTheDocument();
    expect(screen.getByText("fried")).toBeInTheDocument();
  });

  it("calls onSelect when card is clicked", () => {
    const onSelect = vi.fn();
    render(
      <RecipeCard
        id="flour"
        entry={book.flour}
        book={book}
        onSelect={onSelect}
        onEdit={noop}
        onDelete={noop}
      />
    );
    fireEvent.click(screen.getByText("Flour"));
    expect(onSelect).toHaveBeenCalledWith("flour");
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = vi.fn();
    render(
      <RecipeCard
        id="flour"
        entry={book.flour}
        book={book}
        onSelect={noop}
        onEdit={onEdit}
        onDelete={noop}
      />
    );
    fireEvent.click(screen.getByLabelText("Edit Flour"));
    expect(onEdit).toHaveBeenCalledWith("flour");
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDelete = vi.fn();
    render(
      <RecipeCard
        id="flour"
        entry={book.flour}
        book={book}
        onSelect={noop}
        onEdit={noop}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByLabelText("Delete Flour"));
    expect(onDelete).toHaveBeenCalledWith("flour");
  });

  it("edit/delete clicks do not trigger onSelect", () => {
    const onSelect = vi.fn();
    render(
      <RecipeCard
        id="flour"
        entry={book.flour}
        book={book}
        onSelect={onSelect}
        onEdit={noop}
        onDelete={noop}
      />
    );
    fireEvent.click(screen.getByLabelText("Edit Flour"));
    fireEvent.click(screen.getByLabelText("Delete Flour"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("uses singular 'component' for single-component recipe", () => {
    const singleBook: RecipeBook = {
      salt: { name: "Salt" },
      salty: { name: "Salty", components: [{ id: "salt", qty: 1 }] },
    };
    render(
      <RecipeCard
        id="salty"
        entry={singleBook.salty}
        book={singleBook}
        onSelect={noop}
        onEdit={noop}
        onDelete={noop}
      />
    );
    expect(screen.getByText(/1 component —/)).toBeInTheDocument();
  });
});
