import { NextResponse } from "next/server";

import { handleRouteError, jsonError } from "@/lib/api-response";
import { getUser } from "@/lib/auth";
import {
  canModifyExercise,
  serializeExercise,
  updateExerciseSchema,
} from "@/lib/exercises";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getAccessibleExercise(id: string, userId: string) {
  return prisma.exercise.findFirst({
    where: {
      id,
      OR: [{ userId: null }, { userId }],
    },
  });
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getUser(request);
    const { id } = await context.params;

    const exercise = await getAccessibleExercise(id, user.id);
    if (!exercise) {
      return jsonError("Exercise not found", 404);
    }

    return NextResponse.json(serializeExercise(exercise));
  } catch (error) {
    return handleRouteError(error, "GET /api/exercises/[id]");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getUser(request);
    const { id } = await context.params;
    const body = updateExerciseSchema.parse(await request.json());

    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise) {
      return jsonError("Exercise not found", 404);
    }

    if (!canModifyExercise(exercise, user.id)) {
      return jsonError("Cannot modify this exercise", 403);
    }

    const updated = await prisma.exercise.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(serializeExercise(updated));
  } catch (error) {
    return handleRouteError(error, "PATCH /api/exercises/[id]");
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getUser(request);
    const { id } = await context.params;

    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise) {
      return jsonError("Exercise not found", 404);
    }

    if (!canModifyExercise(exercise, user.id)) {
      return jsonError("Cannot delete this exercise", 403);
    }

    await prisma.exercise.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error, "DELETE /api/exercises/[id]");
  }
}
