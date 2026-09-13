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
  tags: z.array(z.string().max(40)).max(12).optional(),
});

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  const category = req.nextUrl.searchParams.get("category");
  const sort = req.nextUrl.searchParams.get("sort") || "recent";
  const minRating = req.nextUrl.searchParams.get("minRating");
  const year = req.nextUrl.searchParams.get("year");
  const tag = req.nextUrl.searchParams.get("tag");

  if (q.length >= 2) {
    const works = await prisma.work.findMany({
      where: {
        originalTitle: { contains: q, mode: "insensitive" },
      },
      take: 12,
      orderBy: { originalTitle: "asc" },
      select: {
        id: true,
        originalTitle: true,
        category: true,
        year: true,
        coverUrl: true,
        tags: true,
      },
    });
    return NextResponse.json(works);
  }

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (year) where.year = parseInt(year);
  if (tag) where.tags = { has: tag };

  const works = await prisma.work.findMany({
    where,
    take: 48,
    include: {
      reviews: { select: { rating: true } },
      _count: { select: { reviews: true } },
    },
  });

  let result = works.map((w) => {
    const avg =
      w.reviews.length > 0
        ? w.reviews.reduce((a, r) => a + r.rating, 0) / w.reviews.length
        : null;
    return { ...w, avgRating: avg, reviewCount: w._count.reviews };
  });

  if (minRating) {
    const min = parseFloat(minRating);
    result = result.filter((w) => w.avgRating !== null && w.avgRating >= min);
  }

  if (sort === "rating") {
    result.sort((a, b) => (b.avgRating ?? -1) - (a.avgRating ?? -1));
  } else if (sort === "reviews") {
    result.sort((a, b) => b.reviewCount - a.reviewCount);
  } else {
    result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return NextResponse.json(result.slice(0, 24));
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
        { error: "Ja existe uma obra com esse nome original" },
        { status: 409 }
      );
    }

    const work = await prisma.work.create({
      data: {
        originalTitle: parsed.originalTitle,
        category: parsed.category,
        year: parsed.year ?? null,
        coverUrl: parsed.coverUrl || null,
        tags: parsed.tags ?? [],
        createdById: session?.user?.id ?? null,
      },
    });

    return NextResponse.json(work, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
