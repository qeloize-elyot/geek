import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  workId: z.string().min(1),
  watchedAt: z.string().optional(),
  isRewatch: z.boolean().optional(),
  note: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const session = await getServerSession(authOptions);
  const targetId = userId || session?.user?.id;

  if (!targetId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const entries = await prisma.diaryEntry.findMany({
    where: { userId: targetId },
    orderBy: { watchedAt: "desc" },
    take: 50,
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

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const entry = await prisma.diaryEntry.create({
      data: {
        userId: session.user.id,
        workId: data.workId,
        watchedAt: data.watchedAt ? new Date(data.watchedAt) : new Date(),
        isRewatch: data.isRewatch ?? false,
        note: data.note ?? null,
      },
    });

    await prisma.userWorkStatus.upsert({
      where: {
        userId_workId: { userId: session.user.id, workId: data.workId },
      },
      update: { status: "COMPLETED" },
      create: {
        userId: session.user.id,
        workId: data.workId,
        status: "COMPLETED",
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }
}
