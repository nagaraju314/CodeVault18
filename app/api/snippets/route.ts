// app/api/snippets/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { Prisma } from "@prisma/client";

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

// ✅ Create a snippet
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { title, code, language, tags } = await req.json();

    if (!title || !code || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        language,
        tags: Array.isArray(tags) ? tags : [],
        authorId: session.user.id,
      },
    });

    return NextResponse.json(snippet, { status: 201 });
  } catch (error) {
    console.error("Error creating snippet:", error);
    return NextResponse.json(
      { error: "Failed to create snippet" },
      { status: 500 }
    );
  }
}

// ✅ Fetch snippets with filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const authorId = searchParams.get("authorId")?.trim();

    const where: Prisma.SnippetWhereInput = {};
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
        { language: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ];
    }
    if (authorId) where.authorId = authorId;

    const snippets = await prisma.snippet.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: {
        likes: { select: { userId: true } },
        comments: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return new NextResponse(JSON.stringify(snippets), {
      headers: { "Content-Type": "application/json", ...cacheHeaders },
    });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json([], { status: 500, headers: cacheHeaders });
  }
}
