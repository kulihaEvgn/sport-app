import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthError } from "@/lib/auth";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown, context: string) {
  if (error instanceof AuthError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof ZodError) {
    const message = error.issues.map((item) => item.message).join("; ");
    return jsonError(message || "Validation error", 400);
  }

  if (
    error instanceof Error &&
    error.message.includes("Record to delete does not exist")
  ) {
    return jsonError("Exercise not found", 404);
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2003"
  ) {
    return jsonError("Exercise is used in a program", 409);
  }

  console.error(context, error);
  return jsonError("Internal server error", 500);
}
