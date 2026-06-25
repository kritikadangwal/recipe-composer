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
    expect(result).toEqual([
      { id: "flour", name: "Flour", quantities: [{ qty: 1 }] },
    ]);
  });

  it("flattens a simple recipe into its ingredients", () => {
    const result = flattenIngredients("bread", sampleBook);
    expect(result).toHaveLength(2);
    const flour = result.find((r) => r.id === "flour");
    const water = result.find((r) => r.id === "water");
    expect(flour?.quantities).toEqual([{ qty: 500 }]);
    expect(water?.quantities).toEqual([{ qty: 300 }]);
  });

  it("flattens a nested recipe recursively", () => {
    const result = flattenIngredients("egg-sandwich", sampleBook);
    expect(result).toHaveLength(3);
    const flour = result.find((r) => r.id === "flour");
    const water = result.find((r) => r.id === "water");
    const egg = result.find((r) => r.id === "egg");
    expect(flour?.quantities).toEqual([{ qty: 1000 }]); // 500 * 2
    expect(water?.quantities).toEqual([{ qty: 600 }]); // 300 * 2
    expect(egg?.quantities).toEqual([{ qty: 1 }]);
    expect(egg?.state).toBe("fried");
  });

  it("applies multiplier correctly", () => {
    const result = flattenIngredients("bread", sampleBook, 3);
    const flour = result.find((r) => r.id === "flour");
    const water = result.find((r) => r.id === "water");
    expect(flour?.quantities).toEqual([{ qty: 1500 }]);
    expect(water?.quantities).toEqual([{ qty: 900 }]);
  });

  it("returns empty array for missing id", () => {
    expect(flattenIngredients("nonexistent", sampleBook)).toEqual([]);
  });

  it("groups different units under the same ingredient", () => {
    const book: RecipeBook = {
      water: { name: "Water", units: ["ml", "cup"] },
      bread: {
        name: "Bread",
        components: [{ id: "water", qty: 300, unit: "ml" }],
      },
      sandwich: {
        name: "Sandwich",
        components: [
          { id: "bread", qty: 2 },
          { id: "water", qty: 1, unit: "cup" },
        ],
      },
    };
    const result = flattenIngredients("sandwich", book);
    expect(result).toHaveLength(1); // one water entry
    const water = result[0];
    expect(water.id).toBe("water");
    expect(water.quantities).toContainEqual({ qty: 600, unit: "ml" });
    expect(water.quantities).toContainEqual({ qty: 1, unit: "cup" });
  });

  it("sums same-unit quantities together", () => {
    const book: RecipeBook = {
      salt: { name: "Salt", units: ["g"] },
      mix: {
        name: "Mix",
        components: [
          { id: "salt", qty: 5, unit: "g" },
          { id: "salt", qty: 3, unit: "g" },
        ],
      },
    };
    const result = flattenIngredients("mix", book);
    expect(result).toHaveLength(1);
    expect(result[0].quantities).toEqual([{ qty: 8, unit: "g" }]);
  });

  it("handles circular references without infinite loop", () => {
    const circular: RecipeBook = {
      a: { name: "A", components: [{ id: "b", qty: 1 }] },
      b: { name: "B", components: [{ id: "a", qty: 1 }] },
    };
    const result = flattenIngredients("a", circular);
    expect(result).toEqual([]);
  });

  it("aggregates duplicate ingredients without units", () => {
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
    expect(result).toHaveLength(1);
    expect(result[0].quantities).toEqual([{ qty: 8 }]);
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
