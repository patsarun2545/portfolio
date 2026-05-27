import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(`admin:${session.user.id}`);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { avatarUrl } = body;

    if (typeof avatarUrl !== "string") {
      return NextResponse.json({ error: "Invalid avatarUrl" }, { status: 400 });
    }

    const about = await prisma.about.upsert({
      where: { id: 1 },
      update: { avatarUrl },
      create: { id: 1, name: "", title: "", bio: "", email: "", avatarUrl },
    });

    return NextResponse.json(about);
  } catch (error) {
    console.error("Error updating avatar:", error);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to update avatar"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
