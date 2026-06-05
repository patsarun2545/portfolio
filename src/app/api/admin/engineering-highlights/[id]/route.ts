import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { engineeringHighlightSchema } from "@/lib/validations";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";

// Partial schema for updates (all fields optional)
const engineeringHighlightUpdateSchema = engineeringHighlightSchema.partial();

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
    const validatedData = engineeringHighlightUpdateSchema.parse(body);

    // Sanitize text fields to prevent XSS
    const sanitizedData: Record<string, string | number | boolean | null> = {};
    if (validatedData.title !== undefined) {
      sanitizedData.title = sanitizeText(validatedData.title);
    }
    if (validatedData.titleTh !== undefined) {
      sanitizedData.titleTh = sanitizeText(validatedData.titleTh);
    }
    if (validatedData.icon !== undefined) {
      sanitizedData.icon = validatedData.icon ? sanitizeText(validatedData.icon) : null;
    }
    if (validatedData.sortOrder !== undefined) {
      sanitizedData.sortOrder = validatedData.sortOrder;
    }
    if (validatedData.isVisible !== undefined) {
      sanitizedData.isVisible = validatedData.isVisible;
    }

    const highlight = await prisma.engineeringHighlight.update({
      where: { id: parseInt(id) },
      data: sanitizedData,
    });

    revalidatePath("/");
    return NextResponse.json(highlight);
  } catch (error) {
    console.error("Failed to update engineering highlight:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to update engineering highlight"
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
    await prisma.engineeringHighlight.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete engineering highlight:", error);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to delete engineering highlight"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
