import { describe, it, expect } from "vitest";
import { isRecipe } from "../types/recipe";
import type { Ingredient, Recipe } from "../types/recipe";

describe("isRecipe", () => {
  it("returns true for an entry with components", () => {
    const recipe: Recipe = {
      name: "Bread",
      components: [{ id: "flour", qty: 500 }],
    };
    expect(isRecipe(recipe)).toBe(true);
  });

  it("returns false for an ingredient without components", () => {
    const ingredient: Ingredient = { name: "Flour" };
    expect(isRecipe(ingredient)).toBe(false);
  });

  it("returns false for an ingredient with states", () => {
    const ingredient: Ingredient = {
      name: "Egg",
      states: ["raw", "boiled"],
    };
    expect(isRecipe(ingredient)).toBe(false);
  });

  it("returns true for a recipe with empty components array", () => {
    const recipe: Recipe = { name: "Empty", components: [] };
    expect(isRecipe(recipe)).toBe(true);
  });
});
