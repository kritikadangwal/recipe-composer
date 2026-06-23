import type { Entry, RecipeBook } from "../types/recipe";
import { isRecipe } from "../types/recipe";
import "./RecipeCard.css";

interface Props {
  id: string;
  entry: Entry;
  book: RecipeBook;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RecipeCard({ id, entry, book, onSelect, onEdit, onDelete }: Props) {
  const recipe = isRecipe(entry);

  return (
    <div className="recipe-card" onClick={() => onSelect(id)}>
      <div className="recipe-card__header">
        <span className={`recipe-card__badge ${recipe ? "recipe-card__badge--recipe" : "recipe-card__badge--ingredient"}`}>
          {recipe ? "Recipe" : "Ingredient"}
        </span>
        <div className="recipe-card__actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn-icon" onClick={() => onEdit(id)} title="Edit" aria-label={`Edit ${entry.name}`}>
            &#9998;
          </button>
          <button className="btn-icon btn-icon--danger" onClick={() => onDelete(id)} title="Delete" aria-label={`Delete ${entry.name}`}>
            &times;
          </button>
        </div>
      </div>
      <h3 className="recipe-card__name">{entry.name}</h3>
      {recipe && (
        <p className="recipe-card__meta">
          {entry.components.length} component{entry.components.length !== 1 ? "s" : ""}
          {" — "}
          {entry.components.map((c) => book[c.id]?.name ?? c.id).join(", ")}
        </p>
      )}
      {!recipe && entry.states && entry.states.length > 0 && (
        <div className="recipe-card__states">
          {entry.states.map((s) => (
            <span key={s} className="state-pill">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}
