import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { experienceSchema } from "@/lib/validations";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const skip = (page - 1) * limit;

    const [experiences, total] = await Promise.all([
      prisma.experience.findMany({
        orderBy: { sortOrder: "asc" },
        skip,
        take: limit,
      }),
      prisma.experience.count(),
    ]);

    return NextResponse.json({
      items: experiences,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch experiences:", error);
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const experience = await prisma.experience.create({
      data: {
        ...sanitizedData,
        startDate: new Date(sanitizedData.startDate),
        endDate: sanitizedData.endDate ? new Date(sanitizedData.endDate) : null,
      },
    });

    revalidatePath("/");
    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error("Failed to create experience:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to create experience"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
