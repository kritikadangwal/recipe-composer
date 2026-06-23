/** A single component reference inside a recipe */
export interface Component {
  id: string;
  qty: number;
  state?: string;
}

/** Base fields shared by every entry */
interface EntryBase {
  name: string;
}

/** An ingredient has no components but may list possible states */
export interface Ingredient extends EntryBase {
  states?: string[];
}

/** A recipe has at least one component */
export interface Recipe extends EntryBase {
  components: Component[];
}

/** An entry is either an ingredient or a recipe */
export type Entry = Ingredient | Recipe;

/** The full dictionary: id → entry */
export type RecipeBook = Record<string, Entry>;

/** Type guard: does this entry have components? */
export function isRecipe(entry: Entry): entry is Recipe {
  return "components" in entry && Array.isArray((entry as Recipe).components);
}

/** A flat ingredient with resolved total quantity */
export interface FlatIngredient {
  id: string;
  name: string;
  qty: number;
  state?: string;
}
