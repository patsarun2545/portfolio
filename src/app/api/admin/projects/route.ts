import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { projectSchema } from "@/lib/validations";
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

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        orderBy: { sortOrder: "asc" },
        skip,
        take: limit,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
      prisma.project.count(),
    ]);

    return NextResponse.json({
      items: projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
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
    const validatedData = projectSchema.parse(body);

    // Sanitize text fields to prevent XSS
    const sanitizedData = {
      ...validatedData,
      title: sanitizeText(validatedData.title),
      description: sanitizeText(validatedData.description),
      longDescription: validatedData.longDescription
        ? sanitizeText(validatedData.longDescription)
        : undefined,
      titleTh: validatedData.titleTh ? sanitizeText(validatedData.titleTh) : undefined,
      descriptionTh: validatedData.descriptionTh
        ? sanitizeText(validatedData.descriptionTh)
        : undefined,
      longDescriptionTh: validatedData.longDescriptionTh
        ? sanitizeText(validatedData.longDescriptionTh)
        : undefined,
      techStack: validatedData.techStack.map((tech) => sanitizeText(tech)),
    };

    const project = await prisma.project.create({
      data: sanitizedData,
    });

    revalidatePath("/");
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to create project"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
