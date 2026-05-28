import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const toggleSchema = z.object({
  isFeatured: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = await checkRateLimit(`admin:${session.user.id}`);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = toggleSchema.parse(body);
    const { isFeatured } = validatedData;

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { isFeatured },
    });

    revalidatePath("/");
    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to toggle featured:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to toggle featured"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
