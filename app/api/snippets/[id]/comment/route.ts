// app/api/snippets/[id]/comment/route.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

interface CommentContext {
  params: {
    id: string
  }
}

interface CommentRequestBody {
  content: string
}

export async function POST(req: Request, context: CommentContext) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = context.params
  const { content } = (await req.json()) as CommentRequestBody

  if (!content?.trim()) {
    return NextResponse.json({ error: "Empty comment" }, { status: 400 })
  }

  await prisma.comment.create({
    data: {
      content: content.trim(),
      authorId: session.user.id,
      snippetId: id,
    },
  })

  return NextResponse.json({ message: "Comment added" })
}
