import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  workIds: z.array(z.string()).max(4),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
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
  });

  return NextResponse.json(favorites);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { workIds } = schema.parse(body);

    await prisma.favorite.deleteMany({ where: { userId: session.user.id } });

    if (workIds.length > 0) {
      await prisma.favorite.createMany({
        data: workIds.map((workId, index) => ({
          userId: session.user.id,
          workId,
          position: index + 1,
        })),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }
}
