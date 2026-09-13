"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

interface Props {
  workId: string;
  existing: { rating: number; content: string } | null;
}

export function ReviewForm({ workId, existing }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(existing?.rating?.toString() || "");
  const [content, setContent] = useState(existing?.content || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId,
          rating: parseFloat(rating),
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar avaliação");
      }

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="rating">Nota (0 a 10)</Label>
        <Input
          id="rating"
          type="number"
          step="0.1"
          min={0}
          max={10}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          required
          className="w-28"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">Avaliação</Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
          placeholder="Escreva sua opinião sobre a obra..."
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : existing ? "Atualizar avaliação" : "Publicar avaliação"}
      </Button>
    </form>
  );
}
