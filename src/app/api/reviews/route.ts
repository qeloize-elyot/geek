import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  workId: z.string().min(1),
  rating: z.number().min(0).max(10),
  content: z.string().min(1).max(5000),
  hasSpoiler: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const work = await prisma.work.findUnique({
      where: { id: data.workId },
    });

    if (!work) {
      return NextResponse.json({ error: "Obra nao encontrada" }, { status: 404 });
    }

    const review = await prisma.review.upsert({
      where: {
        userId_workId: {
          userId: session.user.id,
          workId: data.workId,
        },
      },
      update: {
        rating: data.rating,
        content: data.content,
        hasSpoiler: data.hasSpoiler ?? false,
      },
      create: {
        userId: session.user.id,
        workId: data.workId,
        rating: data.rating,
        content: data.content,
        hasSpoiler: data.hasSpoiler ?? false,
      },
    });

    return NextResponse.json(review);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
