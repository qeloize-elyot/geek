import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DiaryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const entries = await prisma.diaryEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { watchedAt: "desc" },
    take: 100,
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
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Diario</h1>
        <p className="text-sm text-muted-foreground">
          Historico do que voce consumiu, com data e rewatch.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum registro ainda. Na pagina de uma obra, use "Registrar no diario".
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/works/${entry.work.id}`}
                className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-accent transition-colors"
              >
                <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-muted">
                  {entry.work.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.work.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {entry.work.originalTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.work.category}
                    {entry.isRewatch ? " · rewatch" : ""}
                    {entry.note ? ` · ${entry.note}` : ""}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {new Date(entry.watchedAt).toLocaleDateString("pt-BR")}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
