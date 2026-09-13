import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkCard } from "@/components/works/WorkCard";
import { AddToListForm } from "@/components/lists/AddToListForm";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function ListDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const list = await prisma.list.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true } },
      items: {
        orderBy: { position: "asc" },
        include: {
          work: {
            include: {
              reviews: { select: { rating: true } },
            },
          },
        },
      },
    },
  });

  if (!list) notFound();
  if (!list.isPublic && list.userId !== session?.user?.id) notFound();

  const isOwner = session?.user?.id === list.userId;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{list.title}</h1>
        <p className="text-sm text-muted-foreground">
          por{" "}
          <Link href={`/profile/${list.user.id}`} className="hover:underline">
            {list.user.name}
          </Link>
          {` · ${list.items.length} obras`}
        </p>
        {list.description && (
          <p className="text-sm text-muted-foreground">{list.description}</p>
        )}
      </div>

      {isOwner && <AddToListForm listId={list.id} />}

      {list.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Esta lista ainda esta vazia.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {list.items.map((item) => (
            <WorkCard key={item.id} work={item.work} />
          ))}
        </div>
      )}
    </div>
  );
}
