import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api-response";
import { getUser } from "@/lib/auth";
import {
  createExerciseSchema,
  exercisesListWhere,
  listExercisesQuerySchema,
  serializeExercise,
} from "@/lib/exercises";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await getUser(request);
    const { searchParams } = new URL(request.url);
    const query = listExercisesQuerySchema.parse({
      muscleGroup: searchParams.get("muscleGroup") ?? undefined,
    });

    const exercises = await prisma.exercise.findMany({
      where: exercisesListWhere(user.id, query.muscleGroup),
      orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      items: exercises.map(serializeExercise),
    });
  } catch (error) {
    return handleRouteError(error, "GET /api/exercises");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser(request);
    const body = createExerciseSchema.parse(await request.json());

    const exercise = await prisma.exercise.create({
      data: {
        ...body,
        userId: user.id,
      },
    });

    return NextResponse.json(serializeExercise(exercise), { status: 201 });
  } catch (error) {
    return handleRouteError(error, "POST /api/exercises");
  }
}
