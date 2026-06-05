import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const highlights = await prisma.engineeringHighlight.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(highlights);
  } catch (error) {
    console.error("Error fetching engineering highlights:", error);
    return NextResponse.json(
      { error: "Failed to fetch engineering highlights" },
      { status: 500 }
    );
  }
}
