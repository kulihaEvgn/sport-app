import { NextResponse } from "next/server";

import { AuthError, getUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getUser(request);

    return NextResponse.json({
      id: user.id,
      telegramId: user.telegramId.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("GET /api/auth/me", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
