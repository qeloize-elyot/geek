import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  reviewId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { reviewId } = schema.parse(body);

    const existing = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: { userId: session.user.id, reviewId },
      },
    });

    if (existing) {
      await prisma.reviewLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }

    await prisma.reviewLike.create({
      data: { userId: session.user.id, reviewId },
    });

    return NextResponse.json({ liked: true });
  } catch {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }
}
