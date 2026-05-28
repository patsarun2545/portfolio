import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";

const categorySchema = z.object({
  category: z.string().min(1, "Category is required").max(100),
  categoryTh: z.string().max(100).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skills = await prisma.skill.findMany({
      select: {
        category: true,
        categoryTh: true,
      },
      orderBy: { category: "asc" },
    });

    // Extract unique categories
    const categoryMap = new Map<string, string | null>();
    skills.forEach((skill) => {
      if (!categoryMap.has(skill.category)) {
        categoryMap.set(skill.category, skill.categoryTh);
      }
    });

    const categories = Array.from(categoryMap.entries()).map(([category, categoryTh]) => ({
      category,
      categoryTh,
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

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

    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    // Sanitize text fields
    const sanitizedData = {
      category: sanitizeText(validatedData.category),
      categoryTh: validatedData.categoryTh ? sanitizeText(validatedData.categoryTh) : null,
    };

    // Check if category already exists
    const existingSkill = await prisma.skill.findFirst({
      where: { category: sanitizedData.category },
    });

    if (existingSkill) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }

    // Create a placeholder skill with the new category
    const skill = await prisma.skill.create({
      data: {
        name: "Placeholder",
        category: sanitizedData.category,
        categoryTh: sanitizedData.categoryTh,
        proficiency: 0,
        sortOrder: 0,
        isVisible: false,
      },
    });

    revalidatePath("/");
    return NextResponse.json(
      { category: skill.category, categoryTh: skill.categoryTh },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create category:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to create category"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = await checkRateLimit(`admin:${session.user.id}`);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    // Delete all skills with this category
    const result = await prisma.skill.deleteMany({
      where: { category },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({
      message: "Category deleted successfully",
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Failed to delete category:", error);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to delete category"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = await checkRateLimit(`admin:${session.user.id}`);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { oldCategory, newCategory, newCategoryTh } = body;

    if (!oldCategory || !newCategory) {
      return NextResponse.json(
        { error: "Old category and new category are required" },
        { status: 400 }
      );
    }

    const sanitizedNewCategory = sanitizeText(newCategory);
    const sanitizedNewCategoryTh = newCategoryTh ? sanitizeText(newCategoryTh) : null;

    // Check if new category already exists (and it's not the same as old category)
    if (oldCategory !== sanitizedNewCategory) {
      const existingSkill = await prisma.skill.findFirst({
        where: { category: sanitizedNewCategory },
      });

      if (existingSkill) {
        return NextResponse.json({ error: "Category already exists" }, { status: 400 });
      }
    }

    // Update all skills with the old category to use the new category
    const result = await prisma.skill.updateMany({
      where: { category: oldCategory },
      data: {
        category: sanitizedNewCategory,
        categoryTh: sanitizedNewCategoryTh,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({
      message: "Category updated successfully",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Failed to update category:", error);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to update category"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
