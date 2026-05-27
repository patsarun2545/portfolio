import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

// GET - Get all images for a project
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const images = await prisma.projectImage.findMany({
      where: { projectId: parseInt(id) },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to fetch project images:", error);
    return NextResponse.json({ error: "Failed to fetch project images" }, { status: 500 });
  }
}

// POST - Add new images to a project (accepts single url or array of urls)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { url, urls } = body;

    // Handle both single url and array of urls
    const urlsToProcess = Array.isArray(urls) ? urls : url ? [url] : [];

    if (urlsToProcess.length === 0) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Get the current max sortOrder
    const maxSortOrder = await prisma.projectImage.findFirst({
      where: { projectId: parseInt(id) },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const currentSortOrder = maxSortOrder?.sortOrder ?? -1;

    // Create all images in a transaction
    const images = await prisma.$transaction(
      urlsToProcess.map((url: string, index: number) =>
        prisma.projectImage.create({
          data: {
            projectId: parseInt(id),
            url,
            sortOrder: currentSortOrder + 1 + index,
          },
        })
      )
    );

    return NextResponse.json(images, { status: 201 });
  } catch (error) {
    console.error("Failed to add project images:", error);
    return NextResponse.json({ error: "Failed to add project images" }, { status: 500 });
  }
}

// PUT - Reorder images
export async function PUT(request: Request) {
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
    const { images } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "Images array is required" }, { status: 400 });
    }

    // Update sortOrder for each image
    await prisma.$transaction(
      images.map((image: { id: number; sortOrder: number }) =>
        prisma.projectImage.update({
          where: { id: image.id },
          data: { sortOrder: image.sortOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder project images:", error);
    return NextResponse.json({ error: "Failed to reorder project images" }, { status: 500 });
  }
}
