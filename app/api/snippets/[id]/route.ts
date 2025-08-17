// app/api/snippets/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> } // ✅ mark as Promise
) {
  const session = await getServerSession();
  const userId = session?.user?.id ?? null;

  const { id } = await context.params; // ✅ await params

  const snippet = await prisma.snippet.findUnique({
    where: { id },
    include: {
      comments: { orderBy: { createdAt: "desc" } },
      _count: { select: { likes: true } },
      likes: userId
        ? { where: { userId }, select: { id: true } }
        : false,
    },
  });

  if (!snippet) return new Response("Not Found", { status: 404 });

  return Response.json({
    id: snippet.id,
    title: snippet.title,
    code: snippet.code,
    language: snippet.language,
    likesCount: snippet._count.likes,
    likedByMe: userId ? snippet.likes.length > 0 : false,
    comments: snippet.comments,
  });
}
