import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import ImageKit from "imagekit";
import { checkUploadRateLimit } from "@/lib/rate-limit";
import "@/lib/env";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting for uploads (30 uploads per minute)
    const rateLimitResult = await checkUploadRateLimit(`upload:${session.user.id}`);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many upload requests. Please try again later." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB" }, { status: 400 });
    }

    // Validate file type
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400 }
      );
    }

    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Upload timeout")), 30000);

      imagekit.upload(
        {
          file: buffer,
          fileName: file.name,
          folder: folder || undefined,
        },
        (err: Error | null, result: unknown) => {
          clearTimeout(timeout);
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to upload file"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
