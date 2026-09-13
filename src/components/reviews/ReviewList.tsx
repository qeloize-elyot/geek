interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
}

interface Props {
  reviews: Review[];
}

export function ReviewList({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma avaliação ainda. Seja o primeiro a avaliar.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {reviews.map((review) => (
        <li key={review.id} className="border-b border-border pb-6 last:border-0">
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <p className="font-medium text-sm">{review.user.name}</p>
            <p className="text-sm font-medium tabular-nums">{review.rating.toFixed(1)}</p>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {review.content}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(review.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}
