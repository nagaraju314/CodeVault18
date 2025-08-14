import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// Create snippet (POST /api/snippets/[id])
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

// Get single snippet (GET /api/snippets/[id])
export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, email: true } },
        comments: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        likes: true,
      },
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    return NextResponse.json(snippet);
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return NextResponse.json({ error: "Failed to fetch snippet" }, { status: 500 });
  }
}
