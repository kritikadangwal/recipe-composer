import { useState } from "react";
import type { RecipeBook, Component, Ingredient } from "../types/recipe";
import { isRecipe } from "../types/recipe";
import "./RecipeTree.css";

interface Props {
  id: string;
  book: RecipeBook;
  qty?: number;
  unit?: string;
  state?: string;
  depth?: number;
}

export function RecipeTree({ id, book, qty, unit, state, depth = 0 }: Props) {
  console.log("Rendering RecipeTree for id:", id, "depth:", depth);
  const entry = book[id];
  console.log("Entry for id:", id, entry);
  const [expanded, setExpanded] = useState(depth < 2);
  let isIngredientState = true;
  if (entry && state && !isRecipe(entry)) {
    isIngredientState = entry?.states?.includes(state) ?? false;
  }
  if (!entry || !isIngredientState) {
    return (
      <div
        className="tree-node tree-node--missing"
        style={{ marginLeft: depth * 24 }}
      >
        <span className="tree-node__icon">&#x26A0;</span>
        <span className="tree-node__name">{id}</span>
        <span className="tree-node__note">(missing)</span>
      </div>
    );
  }

  const recipe = isRecipe(entry);

  return (
    <div className="tree-node" style={{ marginLeft: depth * 24 }}>
      <div
        className="tree-node__row"
        onClick={() => recipe && setExpanded(!expanded)}
      >
        {recipe && (
          <span
            className={`tree-node__toggle ${expanded ? "tree-node__toggle--open" : ""}`}
          >
            &#9654;
          </span>
        )}
        {!recipe && <span className="tree-node__leaf">&#9679;</span>}
        <span className="tree-node__name">{entry.name}</span>
        {qty !== undefined && (
          <span className="tree-node__qty">
            {qty}
            {unit ? ` ${unit}` : ""}
          </span>
        )}
        {state && <span className="tree-node__state">{state}</span>}
      </div>
      {recipe && expanded && (
        <div className="tree-node__children">
          {entry.components.map((comp: Component, i: number) => (
            <RecipeTree
              key={`${comp.id}-${i}`}
              id={comp.id}
              book={book}
              qty={comp.qty}
              unit={comp.unit}
              state={comp.state}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
