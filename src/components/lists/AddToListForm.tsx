"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  listId: string;
}

export function AddToListForm({ listId }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { id: string; originalTitle: string; category: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

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

  async function add(workId: string) {
    setLoading(true);
    try {
      await fetch(`/api/lists/${listId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workId }),
      });
      setQuery("");
      setResults([]);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 max-w-md">
      <Input
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="Buscar obra para adicionar..."
      />
      {results.length > 0 && (
        <ul className="rounded-lg border border-border overflow-hidden">
          {results.map((work) => (
            <li
              key={work.id}
              className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm truncate">{work.originalTitle}</p>
                <p className="text-xs text-muted-foreground">{work.category}</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={loading}
                onClick={() => add(work.id)}
              >
                Adicionar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
