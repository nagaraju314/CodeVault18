import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { Prisma } from "@prisma/client";

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

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

    const authorIds = [
      ...new Set(
        snippets.map((s) => s.authorId).filter((id): id is string => Boolean(id))
      ),
    ];

    const client = await clientPromise;
    const db = client.db();

    const authors = await db
      .collection("users")
      .find({
        _id: {
          $in: authorIds
            .filter(ObjectId.isValid)
            .map((id) => new ObjectId(id)),
        },
      })
      .project({ _id: 1, name: 1, email: 1 })
      .toArray();

    const snippetsWithAuthors = snippets.map((s) => ({
      ...s,
      author: s.authorId
        ? authors.find((a) => a._id.toString() === s.authorId) || null
        : null,
    }));

    return new NextResponse(JSON.stringify(snippetsWithAuthors), {
      headers: { "Content-Type": "application/json", ...cacheHeaders },
    });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json([], { status: 500, headers: cacheHeaders });
  }
}
