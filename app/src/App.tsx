import { useState, useMemo, useCallback, useEffect } from "react";
import { useRecipeBook } from "./hooks/useRecipeBook";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeDetail } from "./components/RecipeDetail";
import { RecipeForm } from "./components/RecipeForm";
import { ImportExport } from "./components/ImportExport";
import { Toast } from "./components/Toast";
import type { ToastType } from "./components/Toast";
import { isRecipe } from "./types/recipe";
import type { Entry } from "./types/recipe";
import "./App.css";

type Filter = "recipes" | "ingredients";

function App() {
  const { book, loading, error, saveEntry, deleteEntry, importBook } =
    useRecipeBook();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("recipes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({ message, type });
  }, []);

  // Show error toast when hook error changes
  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error, showToast]);

  const entries = useMemo(() => {
    return Object.entries(book)
      .filter(([, entry]) => {
        return filter === "recipes" ? isRecipe(entry) : !isRecipe(entry);
      })
      .filter(([id, entry]) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          entry.name.toLowerCase().includes(q) || id.toLowerCase().includes(q)
        );
      })
      .sort(([, a], [, b]) => a.name.localeCompare(b.name));
  }, [book, search, filter]);

  const counts = useMemo(() => {
    const all = Object.values(book);
    return {
      total: all.length,
      recipes: all.filter(isRecipe).length,
      ingredients: all.filter((e) => !isRecipe(e)).length,
    };
  }, [book]);

  function handleSelect(id: string) {
    setSelectedId(id);
  }

  function handleEdit(id: string) {
    setEditId(id);
    setShowForm(true);
    setSelectedId(null);
  }

  function handleCreate() {
    setEditId(undefined);
    setShowForm(true);
  }

  async function handleSave(id: string, entry: Entry) {
    await saveEntry(id, entry);
    if (!error) {
      setShowForm(false);
      setEditId(undefined);
      showToast(`"${entry.name}" saved successfully`, "success");
    }
  }

  async function handleDelete(id: string) {
    const name = book[id]?.name;
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      await deleteEntry(id);
      if (selectedId === id) setSelectedId(null);
      if (!error) showToast(`"${name}" deleted`, "info");
    }
  }

  async function handleImport(data: Record<string, Entry>) {
    await importBook(data);
    if (!error) {
      const count = Object.keys(data).length;
      showToast(`Imported ${count} entries`, "success");
    }
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Failed to load</h2>
        <p>{error}</p>
        <p className="app-error__hint">
          Make sure the server is running: <code>npm run server</code>
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__left">
          <h1 className="app-header__title">Recipe Composer</h1>
          <span className="app-header__count">{counts.total} entries</span>
        </div>
        <div className="app-header__right">
          <ImportExport book={book} onImport={handleImport} />
          <button className="btn btn--primary" onClick={handleCreate}>
            + New
          </button>
        </div>
      </header>

      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search recipes and ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search"
        />
        <div className="filter-group">
          {(["recipes", "ingredients"] as Filter[]).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "filter-btn--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "recipes"
                ? `Recipes (${counts.recipes})`
                : `Ingredients (${counts.ingredients})`}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          {counts.total === 0 ? (
            <>
              <div className="empty-state__icon">&#127859;</div>
              <h3>No recipes yet</h3>
              <p>
                Create your first entry or import a JSON file to get started.
              </p>
              <button className="btn btn--primary" onClick={handleCreate}>
                + Create First Entry
              </button>
            </>
          ) : (
            <>
              <div className="empty-state__icon">&#128269;</div>
              <h3>No matches</h3>
              <p>Try a different search term or filter.</p>
            </>
          )}
        </div>
      ) : (
        <div className="card-grid">
          {entries.map(([id, entry]) => (
            <RecipeCard
              key={id}
              id={id}
              entry={entry}
              book={book}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {selectedId && book[selectedId] && (
        <RecipeDetail
          id={selectedId}
          entry={book[selectedId]}
          book={book}
          onClose={() => setSelectedId(null)}
          onEdit={handleEdit}
        />
      )}

      {showForm && (
        <RecipeForm
          book={book}
          editId={editId}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditId(undefined);
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
