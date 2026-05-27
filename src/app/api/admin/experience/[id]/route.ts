import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { experienceSchema } from "@/lib/validations";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

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
    const validatedData = experienceSchema.parse(body);

    // Sanitize text fields to prevent XSS
    const sanitizedData = {
      ...validatedData,
      company: sanitizeText(validatedData.company),
      position: sanitizeText(validatedData.position),
      positionTh: validatedData.positionTh ? sanitizeText(validatedData.positionTh) : undefined,
      description: validatedData.description ? sanitizeText(validatedData.description) : undefined,
      descriptionTh: validatedData.descriptionTh
        ? sanitizeText(validatedData.descriptionTh)
        : undefined,
    };

    const experience = await prisma.experience.update({
      where: { id: parseInt(id) },
      data: {
        ...sanitizedData,
        startDate: new Date(sanitizedData.startDate),
        endDate: sanitizedData.endDate ? new Date(sanitizedData.endDate) : null,
      },
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error("Failed to update experience:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to update experience"
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
    await prisma.experience.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete experience:", error);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to delete experience"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
