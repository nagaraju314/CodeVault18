import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: { id: string } }   // 👈 params is NOT a Promise
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = context.params; // ✅ no need to await

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Empty comment" }, { status: 400 });
  }

  await prisma.comment.create({
    data: {
      content: content.trim(),
      authorId: session.user.id,
      snippetId: id,
    },
  });

  return NextResponse.json({ message: "Comment added" });
}
