import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateListForm } from "@/components/lists/CreateListForm";

export const dynamic = "force-dynamic";

export default async function ListsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const lists = await prisma.list.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Listas</h1>
        <p className="text-sm text-muted-foreground">
          Organize obras em colecoes tematicas.
        </p>
      </div>

      <CreateListForm />

      {lists.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Voce ainda nao criou nenhuma lista.
        </p>
      ) : (
        <ul className="space-y-2">
          {lists.map((list) => (
            <li key={list.id}>
              <Link
                href={`/lists/${list.id}`}
                className="block rounded-lg border border-border p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-sm">{list.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {list._count.items}{" "}
                    {list._count.items === 1 ? "obra" : "obras"}
                  </span>
                </div>
                {list.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {list.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
