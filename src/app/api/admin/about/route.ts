import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { aboutSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const about = await prisma.about.findFirst();
    return NextResponse.json(about);
  } catch {
    return NextResponse.json({ error: "Failed to fetch about data" }, { status: 500 });
  }
}

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
    const validatedData = aboutSchema.parse(body);

    // Sanitize text fields to prevent XSS
    const sanitizedData = {
      ...validatedData,
      name: sanitizeText(validatedData.name),
      title: sanitizeText(validatedData.title),
      bio: sanitizeText(validatedData.bio),
      titleTh: validatedData.titleTh ? sanitizeText(validatedData.titleTh) : undefined,
      bioTh: validatedData.bioTh ? sanitizeText(validatedData.bioTh) : undefined,
      email: sanitizeText(validatedData.email),
      phone: validatedData.phone ? sanitizeText(validatedData.phone) : null,
      location: validatedData.location ? sanitizeText(validatedData.location) : null,
    };

    const about = await prisma.about.upsert({
      where: { id: 1 },
      update: sanitizedData,
      create: { id: 1, ...sanitizedData },
    });

    return NextResponse.json(about);
  } catch (error) {
    console.error("Error updating about data:", error);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to update about data"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
