import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getRankedWorks() {
  const works = await prisma.work.findMany({
    include: {
      reviews: { select: { rating: true } },
      _count: { select: { reviews: true } },
    },
  });

  return works
    .map((w) => {
      const avg =
        w.reviews.length > 0
          ? w.reviews.reduce((a, r) => a + r.rating, 0) / w.reviews.length
          : null;
      return { ...w, avgRating: avg, reviewCount: w._count.reviews };
    })
    .filter((w) => w.reviewCount >= 1 && w.avgRating !== null)
    .sort((a, b) => {
      if (b.avgRating !== a.avgRating) {
        return (b.avgRating ?? 0) - (a.avgRating ?? 0);
      }
      return b.reviewCount - a.reviewCount;
    })
    .slice(0, 50);
}

export default async function RankingsPage() {
  const works = await getRankedWorks();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Rankings</h1>
        <p className="text-sm text-muted-foreground">
          Obras com melhor media de avaliacoes na comunidade Geek.
        </p>
      </div>

      {works.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ainda nao ha obras avaliadas o suficiente.
        </p>
      ) : (
        <ol className="space-y-3">
          {works.map((work, index) => (
            <li key={work.id}>
              <Link
                href={`/works/${work.id}`}
                className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-accent transition-colors"
              >
                <span className="w-8 text-center text-sm font-medium tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-muted">
                  {work.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={work.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {work.originalTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {work.category}
                    {work.year ? ` · ${work.year}` : ""}
                    {` · ${work.reviewCount} avaliacoes`}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {work.avgRating!.toFixed(1)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
