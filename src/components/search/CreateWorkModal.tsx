"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

interface Props {
  open: boolean;
  onClose: () => void;
  initialTitle?: string;
  onCreated: (work: { id: string }) => void;
}

const CATEGORIES = [
  "Filme",
  "Série",
  "Livro",
  "Anime",
  "Jogo",
  "Documentário",
  "Outro",
];

export function CreateWorkModal({ open, onClose, initialTitle = "", onCreated }: Props) {
  const [originalTitle, setOriginalTitle] = useState(initialTitle);
  const [category, setCategory] = useState("Filme");
  const [year, setYear] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setOriginalTitle(initialTitle);
      setError("");
    }
  }, [open, initialTitle]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalTitle: originalTitle.trim(),
          category,
          year: year ? parseInt(year) : null,
          coverUrl: coverUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao cadastrar obra");
      }

      const work = await res.json();
      onCreated(work);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Cadastrar obra manualmente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Nome original da obra</Label>
          <Input
            id="title"
            value={originalTitle}
            onChange={(e) => setOriginalTitle(e.target.value)}
            required
            placeholder="Ex: The Shawshank Redemption"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Categoria</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="year">Ano (opcional)</Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="1994"
            min={1800}
            max={2100}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cover">Link da capa (opcional)</Label>
          <Input
            id="cover"
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || !originalTitle.trim()}>
            {loading ? "Salvando..." : "Cadastrar obra"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
