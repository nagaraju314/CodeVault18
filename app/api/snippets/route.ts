import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const title = String(body?.title || "").trim();
    const code = String(body?.code || "").trim();
    const language = String(body?.language || "").trim();
    const tags = Array.isArray(body?.tags) ? body.tags : [];

    if (!title || !code || !language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const snippet = await prisma.snippet.create({
      data: {
        title,
        code,
        language,
        tags,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(snippet, { status: 201 });
  } catch (error) {
    console.error("Error creating snippet:", error);
    return NextResponse.json({ error: "Failed to create snippet" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const authorId = searchParams.get("authorId")?.trim() || "";

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

    // (Mongo) join authors for the cards, as in your doc
    const ids = [
      ...new Set(snippets.map((s) => s.authorId).filter(Boolean) as string[]),
    ];

    const client = await clientPromise;
    const db = client.db();

    const authors = await db
      .collection("users")
      .find({
        _id: {
          $in: ids.filter(ObjectId.isValid).map((id) => new ObjectId(id)),
        },
      })
      .project({ _id: 1, name: 1, email: 1 })
      .toArray();

    const data = snippets.map((s) => ({
      ...s,
      author: s.authorId
        ? authors.find((a) => a._id.toString() === s.authorId) || null
        : null,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json([], { status: 500 });
  }
}
