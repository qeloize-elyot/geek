import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const itemSchema = z.object({
  workId: z.string().min(1),
  note: z.string().max(500).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  const list = await prisma.list.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true } },
      items: {
        orderBy: { position: "asc" },
        include: {
          work: {
            select: {
              id: true,
              originalTitle: true,
              coverUrl: true,
              category: true,
              year: true,
              reviews: { select: { rating: true } },
            },
          },
        },
      },
    },
  });

  if (!list) {
    return NextResponse.json({ error: "Lista nao encontrada" }, { status: 404 });
  }

  if (!list.isPublic && list.userId !== session?.user?.id) {
    return NextResponse.json({ error: "Lista privada" }, { status: 403 });
  }

  return NextResponse.json(list);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const list = await prisma.list.findUnique({ where: { id: params.id } });
  if (!list || list.userId !== session.user.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = itemSchema.parse(body);

    const count = await prisma.listItem.count({ where: { listId: params.id } });

    const item = await prisma.listItem.upsert({
      where: {
        listId_workId: { listId: params.id, workId: data.workId },
      },
      update: { note: data.note ?? null },
      create: {
        listId: params.id,
        workId: data.workId,
        position: count,
        note: data.note ?? null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const list = await prisma.list.findUnique({ where: { id: params.id } });
  if (!list || list.userId !== session.user.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 403 });
  }

  const workId = req.nextUrl.searchParams.get("workId");
  if (workId) {
    await prisma.listItem.deleteMany({
      where: { listId: params.id, workId },
    });
    return NextResponse.json({ ok: true });
  }

  await prisma.list.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
