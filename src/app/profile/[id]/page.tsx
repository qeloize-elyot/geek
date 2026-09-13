import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FavoritesEditor } from "@/components/profile/FavoritesEditor";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function ProfilePage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          work: {
            select: {
              id: true,
              originalTitle: true,
              coverUrl: true,
              category: true,
            },
          },
        },
      },
      favorites: {
        orderBy: { position: "asc" },
        include: {
          work: {
            select: {
              id: true,
              originalTitle: true,
              coverUrl: true,
              category: true,
              year: true,
            },
          },
        },
      },
      lists: {
        where: {
          OR: [{ isPublic: true }, { userId: session?.user?.id }],
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: { _count: { select: { items: true } } },
      },
      _count: {
        select: {
          reviews: true,
          statuses: true,
          diaryEntries: true,
          lists: true,
        },
      },
    },
  });

  if (!user) notFound();

  const isOwn = session?.user?.id === user.id;

  const ratings = user.reviews.map((r) => r.rating);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null;

  const distribution = Array.from({ length: 11 }, (_, i) => ({
    score: i,
    count: ratings.filter((r) => Math.round(r) === i).length,
  }));
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
        <p className="text-sm text-muted-foreground">
          Membro desde{" "}
          {new Date(user.createdAt).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span>
            <strong className="font-medium">{user._count.reviews}</strong>{" "}
            <span className="text-muted-foreground">avaliacoes</span>
          </span>
          <span>
            <strong className="font-medium">{user._count.statuses}</strong>{" "}
            <span className="text-muted-foreground">na watchlist</span>
          </span>
          <span>
            <strong className="font-medium">{user._count.diaryEntries}</strong>{" "}
            <span className="text-muted-foreground">no diario</span>
          </span>
          <span>
            <strong className="font-medium">{user._count.lists}</strong>{" "}
            <span className="text-muted-foreground">listas</span>
          </span>
          {avgRating !== null && (
            <span>
              <strong className="font-medium">{avgRating.toFixed(1)}</strong>{" "}
              <span className="text-muted-foreground">media</span>
            </span>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Favoritos</h2>
        {isOwn ? (
          <FavoritesEditor
            initial={user.favorites.map((f) => ({
              id: f.work.id,
              originalTitle: f.work.originalTitle,
              coverUrl: f.work.coverUrl,
            }))}
          />
        ) : user.favorites.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem favoritos definidos.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {user.favorites.map((f) => (
              <Link key={f.id} href={`/works/${f.work.id}`} className="group space-y-2">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                  {f.work.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.work.coverUrl}
                      alt={f.work.originalTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <p className="text-sm font-medium line-clamp-2 group-hover:underline">
                  {f.work.originalTitle}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {ratings.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Distribuicao de notas</h2>
          <div className="flex items-end gap-1 h-24">
            {distribution.map((d) => (
              <div key={d.score} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-foreground/80 min-h-[2px]"
                  style={{
                    height: `${(d.count / maxCount) * 100}%`,
                  }}
                  title={`${d.score}: ${d.count}`}
                />
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {d.score}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {user.lists.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Listas</h2>
          <ul className="space-y-2">
            {user.lists.map((list) => (
              <li key={list.id}>
                <Link
                  href={`/lists/${list.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-accent transition-colors"
                >
                  <span className="text-sm font-medium">{list.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {list._count.items} obras
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Avaliacoes recentes</h2>
        {user.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma avaliacao ainda.</p>
        ) : (
          <ul className="space-y-4">
            {user.reviews.map((review) => (
              <li
                key={review.id}
                className="flex gap-3 border-b border-border pb-4 last:border-0"
              >
                <Link href={`/works/${review.work.id}`} className="flex-shrink-0">
                  <div className="h-16 w-11 rounded overflow-hidden bg-muted">
                    {review.work.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.work.coverUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                </Link>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <Link
                      href={`/works/${review.work.id}`}
                      className="text-sm font-medium hover:underline truncate"
                    >
                      {review.work.originalTitle}
                    </Link>
                    <span className="text-sm font-medium tabular-nums">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {review.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
