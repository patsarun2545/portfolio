import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { skillSchema } from "@/lib/validations";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = await request.json();
    const validatedData = skillSchema.parse(body);

    // Sanitize text fields to prevent XSS
    const sanitizedData = {
      ...validatedData,
      name: sanitizeText(validatedData.name),
      nameTh: validatedData.nameTh ? sanitizeText(validatedData.nameTh) : undefined,
    };

    const skill = await prisma.skill.update({
      where: { id: parseInt(id) },
      data: sanitizedData,
    });

    revalidatePath("/");
    return NextResponse.json(skill);
  } catch (error) {
    console.error("Failed to update skill:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to update skill"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    await prisma.skill.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete skill:", error);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to delete skill"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
