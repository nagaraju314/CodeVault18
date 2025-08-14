// app/api/snippets/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// CREATE snippet (requires login)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { title, code, language, tags } = await req.json();

    if (!title || !code || !language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to create snippet" }, { status: 500 });
  }
}

// GET all snippets or search
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    // Build Prisma search filter if q exists
    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { code: { contains: q, mode: "insensitive" as const } },
            { language: { contains: q, mode: "insensitive" as const } },
            { tags: { has: q } },
          ],
        }
      : undefined;

    const snippets = await prisma.snippet.findMany({
      where,
      include: {
        likes: { select: { userId: true } },
        comments: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Extract authorIds & ensure they are valid ObjectIds
    const authorIds = [
      ...new Set(snippets.map((s) => s.authorId).filter((id): id is string => Boolean(id))),
    ];

    const client = await clientPromise;
    const db = client.db();

    const authors = await db
      .collection("users")
      .find({
        _id: {
          $in: authorIds
            .filter((id): id is string => ObjectId.isValid(id))
            .map((id) => new ObjectId(id)),
        },
      })
      .project({ _id: 1, name: 1, email: 1 })
      .toArray();

    // Attach author info to snippets
    const snippetsWithAuthors = snippets.map((s) => ({
      ...s,
      author: s.authorId
        ? authors.find((a) => a._id.toString() === s.authorId) || null
        : null,
    }));

    return NextResponse.json(snippetsWithAuthors);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json([], { status: 500 });
  }
}
