import type { RecipeBook, Entry, FlatIngredient } from "../types/recipe";
import { isRecipe } from "../types/recipe";

/**
 * Flatten a recipe into its raw (leaf) ingredients with total quantities.
 * Handles nested recipes by recursively expanding them.
 * Detects circular references to prevent infinite loops.
 */
export function flattenIngredients(
  id: string,
  book: RecipeBook,
  multiplier = 1,
  visited = new Set<string>()
): FlatIngredient[] {
  const entry = book[id];
  if (!entry) return [];

  if (!isRecipe(entry)) {
    return [{ id, name: entry.name, qty: multiplier }];
  }

  if (visited.has(id)) return []; // circular reference guard
  visited.add(id);

  const result = new Map<string, FlatIngredient>();

  for (const comp of entry.components) {
    const children = flattenIngredients(
      comp.id,
      book,
      comp.qty * multiplier,
      new Set(visited)
    );

    for (const child of children) {
      const key = `${child.id}:${comp.state ?? child.state ?? ""}`;
      const existing = result.get(key);
      if (existing) {
        existing.qty += child.qty;
      } else {
        result.set(key, { ...child, state: comp.state ?? child.state });
      }
    }
  }

  return Array.from(result.values());
}

/**
 * Check if adding a component would create a circular dependency.
 */
export function wouldCreateCycle(
  recipeId: string,
  componentId: string,
  book: RecipeBook,
  visited = new Set<string>()
): boolean {
  if (componentId === recipeId) return true;

  const entry = book[componentId];
  if (!entry || !isRecipe(entry)) return false;

  if (visited.has(componentId)) return false;
  visited.add(componentId);

  return entry.components.some((c) =>
    wouldCreateCycle(recipeId, c.id, book, new Set(visited))
  );
}

/** Get all recipes (entries with components) */
export function getRecipes(book: RecipeBook): [string, Entry][] {
  return Object.entries(book).filter(([, e]) => isRecipe(e));
}

/** Get all ingredients (entries without components) */
export function getIngredients(book: RecipeBook): [string, Entry][] {
  return Object.entries(book).filter(([, e]) => !isRecipe(e));
}

/** Generate a URL-safe id from a name */
export function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
