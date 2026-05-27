import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

// DELETE - Delete a specific image
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = await checkRateLimit(`admin:${session.user.id}`);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { imageId } = await params;
    
    await prisma.blogImage.delete({
      where: { id: parseInt(imageId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete blog image:", error);
    return NextResponse.json({ error: "Failed to delete blog image" }, { status: 500 });
  }
}
