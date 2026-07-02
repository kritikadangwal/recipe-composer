import { useParams, useNavigate } from "react-router-dom";
import { useRecipeBook } from "../context/RecipeBookContext";
import { isRecipe } from "../types/recipe";
import { flattenIngredients } from "../utils/recipeUtils";
import { RecipeTree } from "../components/RecipeTree";
import { FlatList } from "../components/FlatList";
import defaultImage from "../assets/default-food.jpg";
import "./RecipePage.css";

export function RecipePage() {
  const { book } = useRecipeBook();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id || !book[id]) {
    return (
      <div className="recipe-page">
        <div className="recipe-page__empty">
          <h2>Recipe not found</h2>
          <p>The recipe you're looking for doesn't exist.</p>
          <button className="btn btn--primary" onClick={() => navigate("/")}>
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  const entry = book[id];
  const recipe = isRecipe(entry);
  const flat = recipe ? flattenIngredients(id, book) : [];

  return (
    <div className="recipe-page">
      <div className="recipe-page__banner">
        <img
          src={entry.image || defaultImage}
          alt={entry.name}
          className="recipe-page__banner-image"
        />
        <div className="recipe-page__banner-fade" />
        <button className="recipe-page__back" onClick={() => navigate("/")} aria-label="Back">
          &larr; Back
        </button>
      </div>

      <div className="recipe-page__content">
        <div className="recipe-page__header">
          <div>
            <span
              className={`recipe-card__badge ${recipe ? "recipe-card__badge--recipe" : "recipe-card__badge--ingredient"}`}
            >
              {recipe ? "Recipe" : "Ingredient"}
            </span>
            <h1 className="recipe-page__title">{entry.name}</h1>
          </div>
          <button className="btn btn--secondary" onClick={() => navigate("/")}>
            Edit
          </button>
        </div>

        {!recipe && entry.states && entry.states.length > 0 && (
          <div className="recipe-page__section">
            <h3 className="recipe-page__section-title">Possible States</h3>
            <div className="recipe-card__states">
              {entry.states.map((s) => (
                <span key={s} className="state-pill">{s}</span>
              ))}
            </div>
          </div>
        )}

        {!recipe && entry.units && entry.units.length > 0 && (
          <div className="recipe-page__section">
            <h3 className="recipe-page__section-title">Allowed Units</h3>
            <div className="recipe-card__states">
              {entry.units.map((u) => (
                <span key={u} className="unit-pill">{u}</span>
              ))}
            </div>
          </div>
        )}

        {recipe && (
          <div className="recipe-page__grid">
            <div className="recipe-page__section">
              <h3 className="recipe-page__section-title">Composition Tree</h3>
              <div className="recipe-page__tree">
                <RecipeTree id={id} book={book} />
              </div>
            </div>

            <div className="recipe-page__section">
              <h3 className="recipe-page__section-title">
                Total Raw Ingredients
              </h3>
              <FlatList items={flat} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
