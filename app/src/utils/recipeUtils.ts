import type { RecipeBook, Entry, FlatIngredient, QtyUnit } from "../types/recipe";
import { isRecipe } from "../types/recipe";

/** Internal type used during recursive flattening */
interface RawFlat {
  id: string;
  name: string;
  qty: number;
  unit?: string;
  state?: string;
}

/**
 * Flatten a recipe into its raw (leaf) ingredients with total quantities.
 * Same unit quantities are summed, different units are listed separately.
 * Detects circular references to prevent infinite loops.
 */
export function flattenIngredients(
  id: string,
  book: RecipeBook,
  multiplier = 1,
  visited = new Set<string>()
): FlatIngredient[] {
  const raw = flattenRaw(id, book, multiplier, visited);

  // Group by id:state, then group quantities by unit within each
  const grouped = new Map<string, FlatIngredient>();

  for (const item of raw) {
    const key = `${item.id}:${item.state ?? ""}`;
    const existing = grouped.get(key);
    if (existing) {
      addQty(existing.quantities, item.qty, item.unit);
    } else {
      grouped.set(key, {
        id: item.id,
        name: item.name,
        quantities: [{ qty: item.qty, unit: item.unit }],
        state: item.state,
      });
    }
  }

  return Array.from(grouped.values());
}

/** Add qty to existing unit bucket or create a new one */
function addQty(quantities: QtyUnit[], qty: number, unit?: string) {
  const match = quantities.find((q) => (q.unit ?? "") === (unit ?? ""));
  if (match) {
    match.qty += qty;
  } else {
    quantities.push({ qty, unit });
  }
}

/** Recursive helper that returns one entry per component occurrence */
function flattenRaw(
  id: string,
  book: RecipeBook,
  multiplier: number,
  visited: Set<string>
): RawFlat[] {
  const entry = book[id];
  if (!entry) return [];

  if (!isRecipe(entry)) {
    return [{ id, name: entry.name, qty: multiplier }];
  }

  if (visited.has(id)) return [];
  visited.add(id);

  const result: RawFlat[] = [];

  for (const comp of entry.components) {
    const children = flattenRaw(comp.id, book, comp.qty * multiplier, new Set(visited));
    for (const child of children) {
      result.push({
        ...child,
        unit: comp.unit ?? child.unit,
        state: comp.state ?? child.state,
      });
    }
  }

  return result;
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
