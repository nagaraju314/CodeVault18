// app/api/snippets/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const snippets = await prisma.snippet.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      comments: {
        take: 3,
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { likes: true },
      },
      likes: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
    },
  });

  const data = snippets.map((s) => ({
    id: s.id,
    title: s.title,
    code: s.code,
    language: s.language,
    likesCount: s._count.likes,
    likedByMe: userId ? s.likes.length > 0 : false,
    comments: s.comments,
  }));

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    select: {
      id: true,
      title: true,
      language: true,
      code: true,
      tags: true,
      createdAt: true,
    },
  });

  return NextResponse.json(snippet, { status: 201 });
}
