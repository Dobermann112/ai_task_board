import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ValidationError, isValidTaskId, parseTaskUpdateInput } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

function isRecordNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidTaskId(id)) {
    return NextResponse.json({ error: "idの形式が不正です" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    return NextResponse.json({ error: "指定されたTaskが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidTaskId(id)) {
    return NextResponse.json({ error: "idの形式が不正です" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "リクエストボディが不正です" }, { status: 400 });
  }

  try {
    const input = parseTaskUpdateInput(body);
    const task = await prisma.task.update({ where: { id }, data: input });
    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (isRecordNotFoundError(error)) {
      return NextResponse.json({ error: "指定されたTaskが見つかりません" }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidTaskId(id)) {
    return NextResponse.json({ error: "idの形式が不正です" }, { status: 400 });
  }

  try {
    await prisma.task.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json({ error: "指定されたTaskが見つかりません" }, { status: 404 });
    }
    throw error;
  }
}
