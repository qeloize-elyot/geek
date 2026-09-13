"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

export function CreateListForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      });
      if (res.ok) {
        const list = await res.json();
        setTitle("");
        setDescription("");
        router.push(`/lists/${list.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md rounded-lg border border-border p-4">
      <p className="text-sm font-medium">Nova lista</p>
      <div className="space-y-1.5">
        <Label htmlFor="list-title">Titulo</Label>
        <Input
          id="list-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ex: Melhores de 2024"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="list-desc">Descricao (opcional)</Label>
        <Input
          id="list-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Sobre o que e esta lista"
        />
      </div>
      <Button type="submit" disabled={loading || !title.trim()}>
        {loading ? "Criando..." : "Criar lista"}
      </Button>
    </form>
  );
}
