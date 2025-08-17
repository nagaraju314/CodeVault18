// app/api/snippets/[id]/like/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await prisma.like.upsert({
    where: { userId_snippetId: { userId: session.user.id, snippetId: id } },
    create: { userId: session.user.id, snippetId: id },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await prisma.like.deleteMany({
    where: { userId: session.user.id, snippetId: id },
  });

  return NextResponse.json({ ok: true });
}
