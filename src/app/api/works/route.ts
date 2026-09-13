import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  originalTitle: z.string().min(1).max(300),
  category: z.string().min(1),
  year: z.number().int().min(1800).max(2100).nullable().optional(),
  coverUrl: z.string().url().nullable().optional().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const works = await prisma.work.findMany({
    where: {
      originalTitle: {
        contains: q,
        mode: "insensitive",
      },
    },
    take: 12,
    orderBy: { originalTitle: "asc" },
    select: {
      id: true,
      originalTitle: true,
      category: true,
      year: true,
      coverUrl: true,
    },
  });

  return NextResponse.json(works);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  try {
    const body = await req.json();
    const parsed = createSchema.parse(body);

    const existing = await prisma.work.findFirst({
      where: {
        originalTitle: {
          equals: parsed.originalTitle,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma obra com esse nome original" },
        { status: 409 }
      );
    }

    const work = await prisma.work.create({
      data: {
        originalTitle: parsed.originalTitle,
        category: parsed.category,
        year: parsed.year ?? null,
        coverUrl: parsed.coverUrl || null,
        createdById: session?.user?.id ?? null,
      },
    });

    return NextResponse.json(work, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
