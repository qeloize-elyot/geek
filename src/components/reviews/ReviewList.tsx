"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  content: string;
  hasSpoiler?: boolean;
  createdAt: Date | string;
  user: { id: string; name: string };
  _count?: { likes: number };
  likedByMe?: boolean;
}

interface Props {
  reviews: Review[];
  isAuthenticated?: boolean;
}

function ReviewItem({
  review,
  isAuthenticated,
}: {
  review: Review;
  isAuthenticated?: boolean;
}) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [liked, setLiked] = useState(review.likedByMe ?? false);
  const [likeCount, setLikeCount] = useState(review._count?.likes ?? 0);
  const [loading, setLoading] = useState(false);

  const showContent = !review.hasSpoiler || revealed;

  async function toggleLike() {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reviews/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount((c) => (data.liked ? c + 1 : Math.max(0, c - 1)));
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="border-b border-border pb-6 last:border-0">
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <Link
          href={`/profile/${review.user.id}`}
          className="font-medium text-sm hover:underline"
        >
          {review.user.name}
        </Link>
        <p className="text-sm font-medium tabular-nums">{review.rating.toFixed(1)}</p>
      </div>

      {showContent ? (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {review.content}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Esta avaliacao contem spoilers. Clique para revelar.
        </button>
      )}

      <div className="flex items-center gap-3 mt-2">
        <p className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2"
            disabled={loading}
            onClick={toggleLike}
            aria-label={liked ? "Remover curtida" : "Curtir"}
          >
            <Heart
              className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`}
            />
            <span className="text-xs tabular-nums">{likeCount}</span>
          </Button>
        )}
        {!isAuthenticated && likeCount > 0 && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Heart className="h-3 w-3" /> {likeCount}
          </span>
        )}
      </div>
    </li>
  );
}

export function ReviewList({ reviews, isAuthenticated }: Props) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma avaliacao ainda. Seja o primeiro a avaliar.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </ul>
  );
}
