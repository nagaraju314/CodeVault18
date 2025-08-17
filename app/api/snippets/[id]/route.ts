import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }   // ✅ plain object
) {
  const { id } = params;

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, email: true } },
        likes: true,
        comments: true,
      },
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...snippet,
      author: snippet.author || null,
    });
  } catch (err) {
    console.error("Error fetching snippet:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
