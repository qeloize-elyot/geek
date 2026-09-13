import Link from "next/link";

interface WorkCardProps {
  work: {
    id: string;
    originalTitle: string;
    category: string;
    year: number | null;
    coverUrl: string | null;
    reviews: { rating: number }[];
  };
}

export function WorkCard({ work }: WorkCardProps) {
  const avg =
    work.reviews.length > 0
      ? work.reviews.reduce((acc, r) => acc + r.rating, 0) / work.reviews.length
      : null;

  return (
    <Link
      href={`/works/${work.id}`}
      className="group block rounded-lg border border-border overflow-hidden hover:border-foreground/20 transition-colors"
    >
      <div className="aspect-[2/3] bg-muted relative overflow-hidden">
        {work.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.coverUrl}
            alt={work.originalTitle}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs p-2 text-center">
            Sem capa
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="font-medium text-sm leading-snug line-clamp-2">
          {work.originalTitle}
        </p>
        <p className="text-xs text-muted-foreground">
          {work.category}
          {work.year ? ` · ${work.year}` : ""}
          {avg !== null ? ` · ${avg.toFixed(1)}` : ""}
        </p>
      </div>
    </Link>
  );
}
