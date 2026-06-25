import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRecipeBook } from "../context/RecipeBookContext";

describe("useRecipeBook context", () => {
  it("throws when used outside RecipeBookProvider", () => {
    // Suppress console.error for the expected error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useRecipeBook());
    }).toThrow("useRecipeBook must be used within a RecipeBookProvider");

    spy.mockRestore();
  });
});
