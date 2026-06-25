import { useState, useMemo } from "react";
import type { Entry, RecipeBook, Component, Ingredient, Recipe } from "../types/recipe";
import { isRecipe } from "../types/recipe";
import { wouldCreateCycle, nameToId } from "../utils/recipeUtils";
import "./RecipeForm.css";

interface Props {
  book: RecipeBook;
  editId?: string;
  onSave: (id: string, entry: Entry) => void;
  onCancel: () => void;
}

type EntryType = "ingredient" | "recipe";

export function RecipeForm({ book, editId, onSave, onCancel }: Props) {
  const existing = editId ? book[editId] : undefined;
  const isEdit = !!editId && !!existing;

  const [type, setType] = useState<EntryType>(
    existing && isRecipe(existing) ? "recipe" : "ingredient"
  );
  const [name, setName] = useState(existing?.name ?? "");
  const [image, setImage] = useState(existing?.image ?? "");
  const [states, setStates] = useState<string[]>(
    existing && !isRecipe(existing) ? existing.states ?? [] : []
  );
  const [stateInput, setStateInput] = useState("");
  const [units, setUnits] = useState<string[]>(
    existing && !isRecipe(existing) ? existing.units ?? [] : []
  );
  const [unitInput, setUnitInput] = useState("");
  const [components, setComponents] = useState<Component[]>(
    existing && isRecipe(existing) ? existing.components : []
  );
  const [error, setError] = useState<string | null>(null);

  const id = isEdit ? editId : nameToId(name);

  const availableComponents = useMemo(() => {
    return Object.entries(book).filter(
      ([key]) => key !== id && !wouldCreateCycle(id, key, book)
    );
  }, [book, id]);

  function addState() {
    const trimmed = stateInput.trim().toLowerCase();
    if (trimmed && !states.includes(trimmed)) {
      setStates([...states, trimmed]);
      setStateInput("");
    }
  }

  function removeState(s: string) {
    setStates(states.filter((st) => st !== s));
  }

  function addUnit() {
    const trimmed = unitInput.trim().toLowerCase();
    if (trimmed && !units.includes(trimmed)) {
      setUnits([...units, trimmed]);
      setUnitInput("");
    }
  }

  function removeUnit(u: string) {
    setUnits(units.filter((ut) => ut !== u));
  }

  function addComponent() {
    if (availableComponents.length === 0) return;
    const firstAvailable = availableComponents.find(
      ([key]) => !components.some((c) => c.id === key)
    );
    if (firstAvailable) {
      setComponents([...components, { id: firstAvailable[0], qty: 1 }]);
    }
  }

  function updateComponent(index: number, updates: Partial<Component>) {
    setComponents(
      components.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  }

  function removeComponent(index: number) {
    setComponents(components.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!isEdit && id in book) {
      setError(`An entry with id "${id}" already exists`);
      return;
    }

    if (type === "recipe" && components.length === 0) {
      setError("A recipe needs at least one component");
      return;
    }

    if (type === "ingredient") {
      const entry: Ingredient = { name: name.trim() };
      if (image.trim()) entry.image = image.trim();
      if (states.length > 0) entry.states = states;
      if (units.length > 0) entry.units = units;
      onSave(id, entry);
    } else {
      const entry: Recipe = { name: name.trim(), components };
      if (image.trim()) entry.image = image.trim();
      onSave(id, entry);
    }
  }

  return (
    <div className="detail-overlay" onClick={onCancel}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detail-panel__header">
          <h2 className="detail-panel__title">
            {isEdit ? `Edit "${existing?.name}"` : "Create New Entry"}
          </h2>
          <button className="btn-icon" onClick={onCancel} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {/* Type toggle */}
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Type</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${type === "ingredient" ? "toggle-btn--active" : ""}`}
                  onClick={() => setType("ingredient")}
                >
                  Ingredient
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${type === "recipe" ? "toggle-btn--active" : ""}`}
                  onClick={() => setType("recipe")}
                >
                  Recipe
                </button>
              </div>
            </div>
          )}

          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="entry-name">Name</label>
            <input
              id="entry-name"
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "ingredient" ? "e.g. Salt" : "e.g. Pancake"}
              disabled={isEdit}
            />
            {!isEdit && name && (
              <span className="form-hint">ID: {id}</span>
            )}
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label className="form-label" htmlFor="entry-image">Image URL (optional)</label>
            <input
              id="entry-image"
              className="form-input"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
            {image && (
              <img
                src={image}
                alt="Preview"
                className="form-image-preview"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                onLoad={(e) => { (e.target as HTMLImageElement).style.display = "block"; }}
              />
            )}
          </div>

          {/* States (ingredient only) */}
          {type === "ingredient" && (
            <div className="form-group">
              <label className="form-label">Possible States</label>
              <div className="states-input-row">
                <input
                  className="form-input"
                  type="text"
                  value={stateInput}
                  onChange={(e) => setStateInput(e.target.value)}
                  placeholder="e.g. boiled"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addState();
                    }
                  }}
                />
                <button type="button" className="btn btn--secondary" onClick={addState}>
                  Add
                </button>
              </div>
              {states.length > 0 && (
                <div className="recipe-card__states" style={{ marginTop: 8 }}>
                  {states.map((s) => (
                    <span
                      key={s}
                      className="state-pill state-pill--removable"
                      onClick={() => removeState(s)}
                      title="Click to remove"
                    >
                      {s} &times;
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Units (ingredient only) */}
          {type === "ingredient" && (
            <div className="form-group">
              <label className="form-label">Allowed Units</label>
              <div className="states-input-row">
                <input
                  className="form-input"
                  type="text"
                  value={unitInput}
                  onChange={(e) => setUnitInput(e.target.value)}
                  placeholder="e.g. g, kg, cup"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addUnit();
                    }
                  }}
                />
                <button type="button" className="btn btn--secondary" onClick={addUnit}>
                  Add
                </button>
              </div>
              {units.length > 0 && (
                <div className="recipe-card__states" style={{ marginTop: 8 }}>
                  {units.map((u) => (
                    <span
                      key={u}
                      className="unit-pill unit-pill--removable"
                      onClick={() => removeUnit(u)}
                      title="Click to remove"
                    >
                      {u} &times;
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Components (recipe only) */}
          {type === "recipe" && (
            <div className="form-group">
              <label className="form-label">Components</label>
              {components.map((comp, i) => {
                const compEntry = book[comp.id];
                const hasStates =
                  compEntry && !isRecipe(compEntry) && compEntry.states?.length;
                const hasUnits =
                  compEntry && !isRecipe(compEntry) && compEntry.units?.length;

                return (
                  <div key={i} className="component-row">
                    <select
                      className="form-select"
                      value={comp.id}
                      onChange={(e) => updateComponent(i, { id: e.target.value, state: undefined, unit: undefined })}
                    >
                      {availableComponents.map(([key, entry]) => (
                        <option key={key} value={key}>
                          {entry.name} {isRecipe(entry) ? "(recipe)" : ""}
                        </option>
                      ))}
                    </select>
                    <input
                      className="form-input form-input--qty"
                      type="number"
                      min={1}
                      value={comp.qty}
                      onChange={(e) =>
                        updateComponent(i, { qty: Math.max(1, Number(e.target.value)) })
                      }
                      aria-label="Quantity"
                    />
                    {hasUnits && (
                      <select
                        className="form-select form-select--unit"
                        value={comp.unit ?? ""}
                        onChange={(e) =>
                          updateComponent(i, { unit: e.target.value || undefined })
                        }
                        aria-label="Unit"
                      >
                        <option value="">—</option>
                        {(compEntry as { units: string[] }).units.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    )}
                    {hasStates && (
                      <select
                        className="form-select form-select--state"
                        value={comp.state ?? ""}
                        onChange={(e) =>
                          updateComponent(i, {
                            state: e.target.value || undefined,
                          })
                        }
                      >
                        <option value="">Any state</option>
                        {(compEntry as { states: string[] }).states.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      className="btn-icon btn-icon--danger"
                      onClick={() => removeComponent(i)}
                      aria-label="Remove component"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                className="btn btn--secondary"
                onClick={addComponent}
                disabled={availableComponents.length === 0}
              >
                + Add Component
              </button>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
