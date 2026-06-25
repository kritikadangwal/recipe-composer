import type { FlatIngredient, QtyUnit } from "../types/recipe";

interface Props {
  items: FlatIngredient[];
}

function formatQuantities(quantities: QtyUnit[]): string {
  return quantities
    .map((q) => `${q.qty}${q.unit ? ` ${q.unit}` : ""}`)
    .join(" + ");
}

export function FlatList({ items }: Props) {
  if (items.length === 0) {
    return <p className="detail-empty">No ingredients resolved.</p>;
  }

  return (
    <div className="flat-list">
      {items.map((item, i) => (
        <div key={i} className="flat-item">
          <span className="flat-item__name">{item.name}</span>
          <span className="flat-item__qty">{formatQuantities(item.quantities)}</span>
          {item.state && (
            <span className="tree-node__state">{item.state}</span>
          )}
        </div>
      ))}
    </div>
  );
}
