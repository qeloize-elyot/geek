"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface WorkItem {
  id: string;
  originalTitle: string;
  coverUrl: string | null;
}

interface Props {
  initial: WorkItem[];
}

export function FavoritesEditor({ initial }: Props) {
  const router = useRouter();
  const [favorites, setFavorites] = useState<WorkItem[]>(initial);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WorkItem[]>([]);
  const [saving, setSaving] = useState(false);

  async function search(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/works?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    setResults(data);
  }

  function add(work: WorkItem) {
    if (favorites.length >= 4) return;
    if (favorites.some((f) => f.id === work.id)) return;
    setFavorites([...favorites, work]);
    setQuery("");
    setResults([]);
  }

  function remove(id: string) {
    setFavorites(favorites.filter((f) => f.id !== id));
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/favorites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workIds: favorites.map((f) => f.id) }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((slot) => {
          const fav = favorites[slot];
          return (
            <div
              key={slot}
              className="aspect-[2/3] rounded-lg border border-dashed border-border bg-muted/40 relative overflow-hidden flex items-center justify-center"
            >
              {fav ? (
                <>
                  {fav.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fav.coverUrl}
                      alt={fav.originalTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-center p-2">{fav.originalTitle}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(fav.id)}
                    className="absolute top-1 right-1 rounded-full bg-background/90 p-1 border border-border"
                    aria-label="Remover"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">{slot + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {favorites.length < 4 && (
        <div className="space-y-2 max-w-md">
          <Input
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Buscar obra para favoritar..."
          />
          {results.length > 0 && (
            <ul className="rounded-lg border border-border overflow-hidden">
              {results.map((work) => (
                <li key={work.id}>
                  <button
                    type="button"
                    onClick={() => add(work)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    {work.originalTitle}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Button onClick={save} disabled={saving} size="sm">
        {saving ? "Salvando..." : "Salvar favoritos"}
      </Button>
    </div>
  );
}
