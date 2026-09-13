import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const session = await getServerSession(authOptions);

  if (userId) {
    const lists = await prisma.list.findMany({
      where: {
        userId,
        OR: [{ isPublic: true }, { userId: session?.user?.id }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { items: true } },
        user: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(lists);
  }

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const lists = await prisma.list.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return NextResponse.json(lists);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const list = await prisma.list.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        isPublic: data.isPublic ?? true,
        userId: session.user.id,
      },
    });

    return NextResponse.json(list, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }
}
