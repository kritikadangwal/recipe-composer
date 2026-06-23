import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import type { RecipeBook, Entry } from "../types/recipe";

const STORE_KEY = "recipe-book";

interface UseRecipeBookReturn {
  book: RecipeBook;
  loading: boolean;
  error: string | null;
  saveEntry: (id: string, entry: Entry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  importBook: (data: RecipeBook) => Promise<void>;
  reload: () => Promise<void>;
}

export function useRecipeBook(): UseRecipeBookReturn {
  const [book, setBook] = useState<RecipeBook>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<RecipeBook>(STORE_KEY);
      setBook(data ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(async (next: RecipeBook) => {
    setBook(next);
    await api.set(STORE_KEY, next);
  }, []);

  const saveEntry = useCallback(
    async (id: string, entry: Entry) => {
      const next = { ...book, [id]: entry };
      await persist(next);
    },
    [book, persist]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const next = { ...book };
      delete next[id];
      await persist(next);
    },
    [book, persist]
  );

  const importBook = useCallback(
    async (data: RecipeBook) => {
      const merged = { ...book, ...data };
      await persist(merged);
    },
    [book, persist]
  );

  return { book, loading, error, saveEntry, deleteEntry, importBook, reload: load };
}
