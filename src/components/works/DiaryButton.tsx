"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  workId: string;
}

export function DiaryButton({ workId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function log() {
    setLoading(true);
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workId, isRewatch: false }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={log} disabled={loading} className="gap-1.5">
      <BookOpen className="h-3.5 w-3.5" />
      {loading ? "Registrando..." : "Registrar no diario"}
    </Button>
  );
}
