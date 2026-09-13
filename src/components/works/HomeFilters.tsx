"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

export function HomeFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const category = params.get("category") || "";
  const sort = params.get("sort") || "recent";
  const minRating = params.get("minRating") || "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select
        value={category}
        onChange={(e) => update("category", e.target.value)}
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
      >
        <option value="">Todas categorias</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => update("sort", e.target.value)}
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
      >
        <option value="recent">Mais recentes</option>
        <option value="rating">Melhor avaliadas</option>
        <option value="reviews">Mais reviewadas</option>
      </select>

      <select
        value={minRating}
        onChange={(e) => update("minRating", e.target.value)}
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
      >
        <option value="">Qualquer nota</option>
        <option value="7">7+</option>
        <option value="8">8+</option>
        <option value="9">9+</option>
      </select>
    </div>
  );
}
