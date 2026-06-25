import { createContext, useContext } from "react";
import { useRecipeBookStore } from "../hooks/useRecipeBook";
import type { UseRecipeBookReturn } from "../hooks/useRecipeBook";

const RecipeBookContext = createContext<UseRecipeBookReturn | null>(null);

export function RecipeBookProvider({ children }: { children: React.ReactNode }) {
  const store = useRecipeBookStore();

  if (store.loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading recipes...</p>
      </div>
    );
  }

  return (
    <RecipeBookContext.Provider value={store}>
      {children}
    </RecipeBookContext.Provider>
  );
}

export function useRecipeBook(): UseRecipeBookReturn {
  const context = useContext(RecipeBookContext);
  if (!context) {
    throw new Error("useRecipeBook must be used within a RecipeBookProvider");
  }
  return context;
}
