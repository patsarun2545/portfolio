import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

const reorderSchema = z.object({
  items: z
    .array(z.object({ id: z.number().int(), sortOrder: z.number().int() }))
    .min(1)
    .max(1000),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = await checkRateLimit(`admin:${session.user.id}`);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { items } = reorderSchema.parse(await request.json());

    await prisma.$transaction(
      items.map((item) =>
        prisma.blogPost.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    revalidatePath("/");
    revalidatePath("/blog");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder blog posts:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to reorder blog posts" }, { status: 500 });
  }
}