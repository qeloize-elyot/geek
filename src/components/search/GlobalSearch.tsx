"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CreateWorkModal } from "./CreateWorkModal";
import Link from "next/link";

interface WorkResult {
  id: string;
  originalTitle: string;
  category: string;
  year: number | null;
  coverUrl: string | null;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WorkResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/works?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar obras pelo nome original..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
        />
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Buscando...</div>
          ) : results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((work) => (
                <li key={work.id}>
                  <Link
                    href={`/works/${work.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="h-12 w-8 flex-shrink-0 overflow-hidden rounded bg-muted">
                      {work.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={work.coverUrl}
                          alt={work.originalTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">{work.originalTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {work.category}
                        {work.year ? ` · ${work.year}` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Nenhuma obra encontrada com esse nome.
              </p>
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setShowCreateModal(true);
                  setIsOpen(false);
                }}
              >
                <Plus className="h-4 w-4" />
                Não encontrou? Cadastre a obra manualmente
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateWorkModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialTitle={query}
        onCreated={(work) => {
          setQuery("");
          window.location.href = `/works/${work.id}`;
        }}
      />
    </div>
  );
}
