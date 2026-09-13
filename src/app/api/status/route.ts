import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  workId: z.string().min(1),
  status: z.enum(["WANT_TO_WATCH", "WATCHING", "COMPLETED", "ON_HOLD", "DROPPED"]).nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    if (data.status === null) {
      await prisma.userWorkStatus.deleteMany({
        where: { userId: session.user.id, workId: data.workId },
      });
      return NextResponse.json({ status: null });
    }

    const record = await prisma.userWorkStatus.upsert({
      where: {
        userId_workId: { userId: session.user.id, workId: data.workId },
      },
      update: { status: data.status },
      create: {
        userId: session.user.id,
        workId: data.workId,
        status: data.status,
      },
    });

    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }
}
