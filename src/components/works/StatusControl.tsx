"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WORK_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

interface Props {
  workId: string;
  currentStatus: string | null;
}

export function StatusControl({ workId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function update(next: string | null) {
    setLoading(true);
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workId, status: next }),
      });
      if (res.ok) {
        setStatus(next);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {WORK_STATUSES.map((s) => (
        <Button
          key={s.value}
          size="sm"
          variant={status === s.value ? "secondary" : "outline"}
          disabled={loading}
          onClick={() => update(status === s.value ? null : s.value)}
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
