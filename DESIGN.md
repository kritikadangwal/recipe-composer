# Recipe Composer — Design Document

## Quick Start

```bash
# Terminal 1: Start the key-value server
npm run server

# Terminal 2: Start the frontend
cd app && npm install && npm run dev
```

Open [http://localhost:5173](http://localhost:5173). On first load the book is empty — use **Import JSON** to load `task/recipes.json`, or create entries manually.

## Architecture

```
app/src/
  api/client.ts          — Typed API client for the key-value server
  hooks/useRecipeBook.ts — Custom hook: CRUD + import, manages loading/error state
  types/recipe.ts        — TypeScript types + type guard (isRecipe)
  utils/recipeUtils.ts   — Pure functions: flatten ingredients, cycle detection, helpers
  components/
    RecipeCard           — Card in the grid (shows badge, components summary, states)
    RecipeDetail         — Slide-in panel: composition tree + total ingredients
    RecipeTree           — Recursive tree component (expands nested recipes)
    RecipeForm           — Create/Edit form with component picker + state selector
    ImportExport         — File import + JSON export
  App.tsx                — Main app: list view, search, filter, panel orchestration
```

### Key design decisions

| Decision | Reasoning |
|----------|-----------|
| **Typed API layer** (`api/client.ts`) | Separates network concerns from UI. Easy to swap if the backend changes. |
| **Custom hook** (`useRecipeBook`) | Encapsulates all data operations. Components stay focused on rendering. |
| **Type guard** (`isRecipe`) | Discriminates ingredients from recipes at the type level, so TypeScript narrows correctly. |
| **Recursive `RecipeTree`** | Recipes can contain recipes. The tree component renders itself recursively, with circular reference protection. |
| **`flattenIngredients` utility** | Expands all nested recipes into raw ingredient totals — like a shopping list. Handles arbitrary nesting depth + circular reference guard. |
| **Cycle detection** (`wouldCreateCycle`) | Prevents users from creating circular dependencies when editing recipes. |
| **Slide-in detail panel** | Shows detail without losing list context. |
| **No CSS framework** | Demonstrates CSS proficiency. Clean, minimal, responsive. |

### Data model understanding

The flat dictionary has two types of entries distinguished by the presence of `components`:

- **Ingredient**: `{ name, states? }` — a raw material, optionally with possible states (raw, boiled, fried, etc.)
- **Recipe**: `{ name, components }` — composed of other entries, each with a quantity and optional state

This is essentially a **DAG** (Directed Acyclic Graph) where recipes point to ingredients or other recipes. The app prevents cycles at edit time.

## Features

1. **View** — Card grid with recipe/ingredient badges. Click to open detail panel.
2. **Search & Filter** — Real-time search + filter by type (all/recipes/ingredients).
3. **Create** — Form with ingredient/recipe toggle. Recipes get a component picker with quantity and state selectors.
4. **Edit** — Pre-populated form. Component changes are validated against cycles.
5. **Delete** — With confirmation dialog.
6. **Detail panel** — Shows composition tree (expandable) and total raw ingredients (flattened).
7. **Import/Export** — Import merges with existing data. Export downloads the full book as JSON in the original format.

## Possible improvements

- Drag-and-drop reordering of components in the form
- Visual dependency graph (which recipes use which ingredients)
- Undo/redo for edits
- Unit/measurement labels on quantities
- Dark mode
- Keyboard shortcuts
