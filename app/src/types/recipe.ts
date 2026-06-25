/** A single component reference inside a recipe */
export interface Component {
  id: string;
  qty: number;
  unit?: string;
  state?: string;
}

/** Base fields shared by every entry */
interface EntryBase {
  name: string;
  image?: string;
}

/** An ingredient has no components but may list possible states and units */
export interface Ingredient extends EntryBase {
  states?: string[];
  units?: string[];
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

/** A quantity with its unit */
export interface QtyUnit {
  qty: number;
  unit?: string;
}

/** A flat ingredient with resolved total quantities grouped by unit */
export interface FlatIngredient {
  id: string;
  name: string;
  quantities: QtyUnit[];
  state?: string;
}
