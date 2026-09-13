import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";
import { StatusControl } from "@/components/works/StatusControl";
import { DiaryButton } from "@/components/works/DiaryButton";

interface Props {
  params: { id: string };
}

export default async function WorkPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const work = await prisma.work.findUnique({
    where: { id: params.id },
    include: {
      reviews: {
        include: {
          user: { select: { id: true, name: true } },
          _count: { select: { likes: true } },
          likes: session?.user?.id
            ? { where: { userId: session.user.id }, select: { id: true } }
            : false,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!work) notFound();

  const userStatus = session
    ? await prisma.userWorkStatus.findUnique({
        where: {
          userId_workId: { userId: session.user.id, workId: work.id },
        },
      })
    : null;

  const userReview = session
    ? work.reviews.find((r) => r.userId === session.user.id)
    : null;

  const avg =
    work.reviews.length > 0
      ? work.reviews.reduce((acc, r) => acc + r.rating, 0) / work.reviews.length
      : null;

  const reviewsForList = work.reviews.map((r) => ({
    ...r,
    likedByMe: Array.isArray(r.likes) ? r.likes.length > 0 : false,
  }));

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

        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {work.originalTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {work.category}
              {work.year ? ` · ${work.year}` : ""}
            </p>
            {work.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {work.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {avg !== null && (
              <p className="text-sm">
                Media: <span className="font-medium">{avg.toFixed(1)}</span>{" "}
                <span className="text-muted-foreground">
                  ({work.reviews.length}{" "}
                  {work.reviews.length === 1 ? "avaliacao" : "avaliacoes"})
                </span>
              </p>
            )}
          </div>

          {session && (
            <div className="space-y-3 pt-1">
              <StatusControl
                workId={work.id}
                currentStatus={userStatus?.status ?? null}
              />
              <DiaryButton workId={work.id} />
            </div>
          )}
        </div>
      </div>

      {session && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">
            {userReview ? "Sua avaliacao" : "Avaliar esta obra"}
          </h2>
          <ReviewForm
            workId={work.id}
            existing={
              userReview
                ? {
                    rating: userReview.rating,
                    content: userReview.content,
                    hasSpoiler: userReview.hasSpoiler,
                  }
                : null
            }
          />
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Avaliacoes</h2>
        <ReviewList
          reviews={reviewsForList}
          isAuthenticated={!!session}
        />
      </section>
    </div>
  );
}
