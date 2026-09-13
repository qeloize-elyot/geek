import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkCard } from "@/components/works/WorkCard";
import { statusLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const statuses = await prisma.userWorkStatus.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      work: {
        include: {
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  const grouped = {
    WANT_TO_WATCH: statuses.filter((s) => s.status === "WANT_TO_WATCH"),
    WATCHING: statuses.filter((s) => s.status === "WATCHING"),
    COMPLETED: statuses.filter((s) => s.status === "COMPLETED"),
    ON_HOLD: statuses.filter((s) => s.status === "ON_HOLD"),
    DROPPED: statuses.filter((s) => s.status === "DROPPED"),
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
        <p className="text-sm text-muted-foreground">
          Seu acompanhamento pessoal de obras.
        </p>
      </div>

      {statuses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma obra na sua lista ainda. Abra uma obra e escolha um status.
        </p>
      ) : (
        Object.entries(grouped).map(([key, items]) =>
          items.length === 0 ? null : (
            <section key={key} className="space-y-4">
              <h2 className="text-lg font-medium">
                {statusLabel(key)}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {items.length}
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {items.map((item) => (
                  <WorkCard key={item.id} work={item.work} />
                ))}
              </div>
            </section>
          )
        )
      )}
    </div>
  );
}
