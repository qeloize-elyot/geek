import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";

interface Props {
  params: { id: string };
}

export default async function WorkPage({ params }: Props) {
  const work = await prisma.work.findUnique({
    where: { id: params.id },
    include: {
      reviews: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!work) notFound();

  const session = await getServerSession(authOptions);
  const userReview = session
    ? work.reviews.find((r) => r.userId === session.user.id)
    : null;

  const avg =
    work.reviews.length > 0
      ? work.reviews.reduce((acc, r) => acc + r.rating, 0) / work.reviews.length
      : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-40 flex-shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-muted">
          {work.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={work.coverUrl}
              alt={work.originalTitle}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
              Sem capa
            </div>
          )}
        </div>

        <div className="space-y-3 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {work.originalTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {work.category}
            {work.year ? ` · ${work.year}` : ""}
          </p>
          {avg !== null && (
            <p className="text-sm">
              Média: <span className="font-medium">{avg.toFixed(1)}</span>{" "}
              <span className="text-muted-foreground">
                ({work.reviews.length} {work.reviews.length === 1 ? "avaliação" : "avaliações"})
              </span>
            </p>
          )}
        </div>
      </div>

      {session && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">
            {userReview ? "Sua avaliação" : "Avaliar esta obra"}
          </h2>
          <ReviewForm
            workId={work.id}
            existing={userReview ? { rating: userReview.rating, content: userReview.content } : null}
          />
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Avaliações</h2>
        <ReviewList reviews={work.reviews} />
      </section>
    </div>
  );
}
