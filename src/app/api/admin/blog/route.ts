import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { blogSchema } from "@/lib/validations";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeText, sanitizeHTML } from "@/lib/sanitize";
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

    const [blogPosts, total] = await Promise.all([
      prisma.blogPost.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
      prisma.blogPost.count(),
    ]);

    return NextResponse.json({
      items: blogPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
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
    const validatedData = blogSchema.parse(body);

    // Sanitize text fields to prevent XSS
    const sanitizedData = {
      ...validatedData,
      title: sanitizeText(validatedData.title),
      slug: sanitizeText(validatedData.slug),
      excerpt: validatedData.excerpt ? sanitizeHTML(validatedData.excerpt) : null,
      titleTh: validatedData.titleTh ? sanitizeText(validatedData.titleTh) : undefined,
      excerptTh: validatedData.excerptTh ? sanitizeHTML(validatedData.excerptTh) : undefined,
      contentTh: validatedData.contentTh ? sanitizeHTML(validatedData.contentTh) : undefined,
      tags: validatedData.tags.map((tag) => sanitizeText(tag)),
    };

    // Handle slug collision by auto-generating unique slug
    let finalSlug = sanitizedData.slug;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug: finalSlug },
      });

      if (!existingPost) {
        break;
      }

      // Generate unique slug by appending timestamp
      finalSlug = `${sanitizedData.slug}-${Date.now()}`;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "Failed to generate unique slug after multiple attempts" },
        { status: 409 }
      );
    }

    const blogPost = await prisma.blogPost.create({
      data: {
        ...sanitizedData,
        slug: finalSlug,
        content: sanitizeHTML(sanitizedData.content),
        publishedAt: sanitizedData.isPublished ? new Date() : null,
      },
    });

    revalidatePath("/");
    revalidatePath("/blog");
    return NextResponse.json(blogPost, { status: 201 });
  } catch (error) {
    console.error("Failed to create blog post:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to create blog post"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
