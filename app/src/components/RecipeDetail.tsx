import type { Entry, RecipeBook } from "../types/recipe";
import { isRecipe } from "../types/recipe";
import { flattenIngredients } from "../utils/recipeUtils";
import { RecipeTree } from "./RecipeTree";
import defaultImage from "../assets/default-food.jpg";
import "./RecipeDetail.css";

interface Props {
  id: string;
  entry: Entry;
  book: RecipeBook;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export function RecipeDetail({ id, entry, book, onClose, onEdit }: Props) {
  const recipe = isRecipe(entry);
  const flat = recipe ? flattenIngredients(id, book) : [];

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detail-banner">
          <img src={entry.image || defaultImage} alt={entry.name} className="detail-banner__image" />
          <div className="detail-banner__fade" />
        </div>
        <div className="detail-panel__header">
          <div>
            <span className={`recipe-card__badge ${recipe ? "recipe-card__badge--recipe" : "recipe-card__badge--ingredient"}`}>
              {recipe ? "Recipe" : "Ingredient"}
            </span>
            <h2 className="detail-panel__title">{entry.name}</h2>
          </div>
          <div className="detail-panel__actions">
            <button className="btn btn--secondary" onClick={() => onEdit(id)}>
              Edit
            </button>
            <button className="btn-icon" onClick={onClose} aria-label="Close">
              &times;
            </button>
          </div>
        </div>

        {!recipe && entry.states && entry.states.length > 0 && (
          <div className="detail-section">
            <h4 className="detail-section__title">Possible States</h4>
            <div className="recipe-card__states">
              {entry.states.map((s) => (
                <span key={s} className="state-pill">{s}</span>
              ))}
            </div>
          </div>
        )}

        {!recipe && entry.units && entry.units.length > 0 && (
          <div className="detail-section">
            <h4 className="detail-section__title">Allowed Units</h4>
            <div className="recipe-card__states">
              {entry.units.map((u) => (
                <span key={u} className="unit-pill">{u}</span>
              ))}
            </div>
          </div>
        )}

        {recipe && (
          <>
            <div className="detail-section">
              <h4 className="detail-section__title">Composition Tree</h4>
              <div className="detail-tree">
                <RecipeTree id={id} book={book} />
              </div>
            </div>

            <div className="detail-section">
              <h4 className="detail-section__title">
                Total Raw Ingredients
                <span className="detail-section__subtitle">
                  (all sub-recipes expanded)
                </span>
              </h4>
              <div className="flat-list">
                {flat.map((item, i) => (
                  <div key={i} className="flat-item">
                    <span className="flat-item__name">{item.name}</span>
                    <span className="flat-item__qty">{item.qty}{item.unit ? ` ${item.unit}` : ""}</span>
                    {item.state && (
                      <span className="tree-node__state">{item.state}</span>
                    )}
                  </div>
                ))}
                {flat.length === 0 && (
                  <p className="detail-empty">No ingredients resolved.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
