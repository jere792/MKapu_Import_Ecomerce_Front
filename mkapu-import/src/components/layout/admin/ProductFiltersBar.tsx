"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";

export type FilterCategory = {
  id: string | number;
  name: string;
};

type ProductFiltersBarProps = {
  categories: FilterCategory[];
  search: string;
  onSearch: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  placeholder?: string;
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "0.68rem 0.9rem",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  fontSize: "0.875rem",
  background: "#fff",
  color: "#1a1a1a",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export default function ProductFiltersBar({
  categories,
  search,
  onSearch,
  category,
  onCategory,
  placeholder = "Buscar por nombre o código...",
}: ProductFiltersBarProps) {
  const [input, setInput] = useState(search);
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleInput(value: string) {
    setInput(value);
    if (timer.current) clearTimeout(timer.current);

    const t = value.trim();
    if (t.length < 3) {
      if (search !== "") onSearch("");
      return;
    }

    timer.current = setTimeout(() => onSearch(t), 250);
  }

  function clear() {
    if (timer.current) clearTimeout(timer.current);
    setInput("");
    onSearch("");
    onCategory("");
  }

  const hasFilters = search !== "" || category !== "";

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            left: 11,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            pointerEvents: "none",
          }}
        />
        <input
          style={{
            ...inp,
            paddingLeft: 34,
            borderColor: focused ? "#f5a623" : "#e5e7eb",
            boxShadow: focused ? "0 0 0 3px rgba(245,166,35,0.12)" : "none",
          }}
          placeholder={placeholder}
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>

      <select
        style={{ ...inp, minWidth: 220, width: "auto" }}
        value={category}
        onChange={(e) => onCategory(e.target.value)}
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={String(c.id)} value={String(c.id)}>
            {c.name}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clear}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "0.68rem 1rem",
            borderRadius: "9px",
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#6b7280",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          <X size={14} />
          Limpiar
        </button>
      )}
    </div>
  );
}