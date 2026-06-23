import { useRef } from "react";
import type { RecipeBook } from "../types/recipe";
import "./ImportExport.css";

interface Props {
  book: RecipeBook;
  onImport: (data: RecipeBook) => void;
}

export function ImportExport({ book, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = JSON.stringify(book, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recipes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (typeof data === "object" && data !== null && !Array.isArray(data)) {
          onImport(data as RecipeBook);
        } else {
          alert("Invalid format: expected a JSON object (dictionary).");
        }
      } catch {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be re-imported
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="import-export">
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="import-export__input"
        id="import-file"
      />
      <label htmlFor="import-file" className="btn btn--secondary import-export__btn">
        Import JSON
      </label>
      <button className="btn btn--secondary import-export__btn" onClick={handleExport}>
        Export JSON
      </button>
    </div>
  );
}
