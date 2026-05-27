import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { blogSchema } from "@/lib/validations";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { Prisma } from "@prisma/client";

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

    if (Object.keys(body).length === 1 && "isPublished" in body) {
      const blogPost = await prisma.blogPost.update({
        where: { id: parseInt(id) },
        data: {
          isPublished: body.isPublished,
          publishedAt: body.isPublished ? new Date() : null,
        },
      });
      return NextResponse.json(blogPost);
    }

    const validatedData = blogSchema.parse(body);

    // Sanitize text fields to prevent XSS
    const sanitizedData = {
      ...validatedData,
      title: sanitizeText(validatedData.title),
      slug: sanitizeText(validatedData.slug),
      excerpt: validatedData.excerpt ? DOMPurify.sanitize(validatedData.excerpt) : null,
      titleTh: validatedData.titleTh ? sanitizeText(validatedData.titleTh) : undefined,
      excerptTh: validatedData.excerptTh ? DOMPurify.sanitize(validatedData.excerptTh) : undefined,
      contentTh: validatedData.contentTh ? DOMPurify.sanitize(validatedData.contentTh) : undefined,
      tags: validatedData.tags.map((tag) => sanitizeText(tag)),
    };

    // Check for slug collision (only if slug is being changed)
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: sanitizedData.slug },
    });
    if (existingPost && existingPost.id !== parseInt(id)) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }

    const blogPost = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: {
        ...sanitizedData,
        content: DOMPurify.sanitize(sanitizedData.content),
        publishedAt: sanitizedData.isPublished ? new Date() : null,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error("Failed to update blog post:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to update blog post"
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
    await prisma.blogPost.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
