import { describe, it, expect } from "vitest";
import type { RecipeBook } from "../types/recipe";
import {
  flattenIngredients,
  wouldCreateCycle,
  getRecipes,
  getIngredients,
  nameToId,
} from "../utils/recipeUtils";

const sampleBook: RecipeBook = {
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

describe("flattenIngredients", () => {
  it("returns the ingredient itself for a leaf ingredient", () => {
    const result = flattenIngredients("flour", sampleBook);
    expect(result).toEqual([{ id: "flour", name: "Flour", qty: 1 }]);
  });

  it("flattens a simple recipe into its ingredients", () => {
    const result = flattenIngredients("bread", sampleBook);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ id: "flour", name: "Flour", qty: 500 });
    expect(result).toContainEqual({ id: "water", name: "Water", qty: 300 });
  });

  it("flattens a nested recipe recursively", () => {
    const result = flattenIngredients("egg-sandwich", sampleBook);
    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ id: "flour", name: "Flour", qty: 1000 }); // 500 * 2
    expect(result).toContainEqual({ id: "water", name: "Water", qty: 600 }); // 300 * 2
    expect(result).toContainEqual({
      id: "egg",
      name: "Egg",
      qty: 1,
      state: "fried",
    });
  });

  it("applies multiplier correctly", () => {
    const result = flattenIngredients("bread", sampleBook, 3);
    expect(result).toContainEqual({ id: "flour", name: "Flour", qty: 1500 });
    expect(result).toContainEqual({ id: "water", name: "Water", qty: 900 });
  });

  it("returns empty array for missing id", () => {
    expect(flattenIngredients("nonexistent", sampleBook)).toEqual([]);
  });

  it("handles circular references without infinite loop", () => {
    const circular: RecipeBook = {
      a: { name: "A", components: [{ id: "b", qty: 1 }] },
      b: { name: "B", components: [{ id: "a", qty: 1 }] },
    };
    const result = flattenIngredients("a", circular);
    expect(result).toEqual([]);
  });

  it("aggregates duplicate ingredients", () => {
    const book: RecipeBook = {
      salt: { name: "Salt" },
      mix: {
        name: "Mix",
        components: [
          { id: "salt", qty: 5 },
          { id: "salt", qty: 3 },
        ],
      },
    };
    const result = flattenIngredients("mix", book);
    expect(result).toEqual([{ id: "salt", name: "Salt", qty: 8 }]);
  });
});

describe("wouldCreateCycle", () => {
  it("returns true when adding self as component", () => {
    expect(wouldCreateCycle("bread", "bread", sampleBook)).toBe(true);
  });

  it("returns false for a valid ingredient component", () => {
    expect(wouldCreateCycle("bread", "flour", sampleBook)).toBe(false);
  });

  it("returns false for a valid recipe component", () => {
    expect(wouldCreateCycle("egg-sandwich", "bread", sampleBook)).toBe(false);
  });

  it("detects indirect cycle", () => {
    const book: RecipeBook = {
      a: { name: "A", components: [{ id: "b", qty: 1 }] },
      b: { name: "B", components: [{ id: "c", qty: 1 }] },
      c: { name: "C", components: [] },
    };
    // Adding "a" to "c" would create c -> a -> b -> c
    expect(wouldCreateCycle("c", "a", book)).toBe(true);
  });

  it("returns false for missing component id", () => {
    expect(wouldCreateCycle("bread", "nonexistent", sampleBook)).toBe(false);
  });
});

describe("getRecipes", () => {
  it("returns only entries with components", () => {
    const recipes = getRecipes(sampleBook);
    const ids = recipes.map(([id]) => id);
    expect(ids).toContain("bread");
    expect(ids).toContain("egg-sandwich");
    expect(ids).not.toContain("flour");
    expect(ids).not.toContain("egg");
  });
});

describe("getIngredients", () => {
  it("returns only entries without components", () => {
    const ingredients = getIngredients(sampleBook);
    const ids = ingredients.map(([id]) => id);
    expect(ids).toContain("flour");
    expect(ids).toContain("water");
    expect(ids).toContain("egg");
    expect(ids).not.toContain("bread");
  });
});

describe("nameToId", () => {
  it("converts name to lowercase kebab-case", () => {
    expect(nameToId("Egg Sandwich")).toBe("egg-sandwich");
  });

  it("strips special characters", () => {
    expect(nameToId("Mac & Cheese!")).toBe("mac-cheese");
  });

  it("trims leading/trailing hyphens", () => {
    expect(nameToId("  Hello World  ")).toBe("hello-world");
  });

  it("handles single word", () => {
    expect(nameToId("Salt")).toBe("salt");
  });

  it("collapses multiple separators", () => {
    expect(nameToId("one---two___three")).toBe("one-two-three");
  });
});
