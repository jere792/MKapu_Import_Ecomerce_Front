"use client";

interface Props {
  cats: string[];
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryMenu({ cats, active, onChange }: Props) {
  return (
    <div
      className="flex gap-2 px-5 py-3 overflow-x-auto bg-white border-b border-line [&::-webkit-scrollbar]:h-[3px]"
      role="navigation"
      aria-label="Categorías"
    >
      {cats.map((cat) => (
        <button
          key={cat}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full border-[1.5px] text-xs font-semibold cursor-pointer bg-transparent transition-all duration-150 border-brand text-brand-dark ${
            active === cat ? "!bg-brand !text-white !border-brand" : "hover:bg-brand hover:text-white hover:border-brand"
          }`}
          onClick={() => onChange(cat)}
          aria-pressed={active === cat}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}