import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, email: true } },
        likes: true,
        comments: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!snippet) {
      return NextResponse.json(
        { error: "Snippet not found" },
        { status: 404, headers: cacheHeaders }
      );
    }

    return new NextResponse(
      JSON.stringify({ ...snippet, author: snippet.author || null }),
      { headers: { "Content-Type": "application/json", ...cacheHeaders } }
    );
  } catch (err) {
    console.error("Error fetching snippet:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: cacheHeaders }
    );
  }
}
