import { GlobalSearch } from "@/components/search/GlobalSearch";
import { prisma } from "@/lib/prisma";
import { WorkCard } from "@/components/works/WorkCard";

export const dynamic = "force-dynamic";

async function getRecentWorks() {
  return prisma.work.findMany({
    take: 12,
    orderBy: { createdAt: "desc" },
    include: {
      reviews: {
        select: { rating: true },
      },
    },
  });
}

export default async function HomePage() {
  const works = await getRecentWorks();

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Avaliações de entretenimento
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg">
          Busque obras pelo nome original. Se não encontrar, cadastre manualmente.
        </p>
        <GlobalSearch />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Obras recentes</h2>
        {works.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma obra cadastrada ainda. Use a busca acima para adicionar a primeira.
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
