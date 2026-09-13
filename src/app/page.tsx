import { Suspense } from "react";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { prisma } from "@/lib/prisma";
import { WorkCard } from "@/components/works/WorkCard";
import { HomeFilters } from "@/components/works/HomeFilters";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    category?: string;
    sort?: string;
    minRating?: string;
  };
}

async function getWorks(params: Props["searchParams"]) {
  const where: { category?: string } = {};
  if (params.category) where.category = params.category;

  const works = await prisma.work.findMany({
    where,
    take: 48,
    include: {
      reviews: { select: { rating: true } },
      _count: { select: { reviews: true } },
    },
  });

  let result = works.map((w) => {
    const avg =
      w.reviews.length > 0
        ? w.reviews.reduce((a, r) => a + r.rating, 0) / w.reviews.length
        : null;
    return { ...w, avgRating: avg, reviewCount: w._count.reviews };
  });

  if (params.minRating) {
    const min = parseFloat(params.minRating);
    result = result.filter((w) => w.avgRating !== null && w.avgRating >= min);
  }

  const sort = params.sort || "recent";
  if (sort === "rating") {
    result.sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
  } else if (sort === "reviews") {
    result.sort((a, b) => b.reviewCount - a.reviewCount);
  } else {
    result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return result.slice(0, 24);
}

export default async function HomePage({ searchParams }: Props) {
  const works = await getWorks(searchParams);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Geek</h1>
        <p className="text-muted-foreground text-sm max-w-lg">
          Seu catalogo pessoal de filmes, series, livros, animes e jogos.
          Avalie, registre e organize o que voce consome.
        </p>
        <GlobalSearch />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-medium">Explorar</h2>
          <Suspense fallback={null}>
            <HomeFilters />
          </Suspense>
        </div>

        {works.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma obra encontrada. Use a busca para cadastrar a primeira.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
