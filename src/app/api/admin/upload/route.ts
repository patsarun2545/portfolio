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
      console.error("Upload error: No file provided in FormData");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Log file details for debugging
    console.log("Upload file details:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    // Validate file size (max 10MB for mobile devices)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      console.error("Upload error: File too large", { size: file.size, maxSize: MAX_FILE_SIZE });
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 });
    }

    // Validate file is not empty
    if (file.size === 0) {
      console.error("Upload error: Empty file");
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    // Validate file type - more flexible for mobile devices
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/pjpeg", // Progressive JPEG from some mobile browsers
      "image/heic", // iOS HEIC images
      "image/heif", // iOS HEIF images
      "application/octet-stream", // Fallback for some mobile browsers
      "", // Empty MIME type from some mobile browsers
    ];

    // Check file extension first (more reliable for mobile)
    const fileName = file.name.toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
    const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));

    // If no extension, rely on magic bytes validation only
    if (!hasValidExtension && fileName.includes(".")) {
      console.error("Upload error: Invalid file extension", { fileName });
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and HEIC are allowed" },
        { status: 400 }
      );
    }

    // Check MIME type (if provided) as additional validation
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      console.warn("Upload warning: Unexpected MIME type", { type: file.type, fileName });
      // Don't reject - rely on extension and magic bytes instead
    }

    // Validate file is actually an image using magic bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check magic bytes for common image formats
    const magicBytes = buffer.subarray(0, 12);
    const isJPEG = magicBytes[0] === 0xff && magicBytes[1] === 0xd8 && magicBytes[2] === 0xff;
    const isPNG =
      magicBytes[0] === 0x89 &&
      magicBytes[1] === 0x50 &&
      magicBytes[2] === 0x4e &&
      magicBytes[3] === 0x47;
    const isWebP =
      magicBytes[0] === 0x52 &&
      magicBytes[1] === 0x49 &&
      magicBytes[2] === 0x46 &&
      magicBytes[3] === 0x46 &&
      magicBytes[8] === 0x57 &&
      magicBytes[9] === 0x45 &&
      magicBytes[10] === 0x42 &&
      magicBytes[11] === 0x50;

    // HEIC/HEIF magic bytes are more complex
    // Structure: [size:4][ftyp:4][brand:4]
    // Brand types: heic, heix, hevc, hevx, heim, heis, hevm, hevs
    const isHEIC =
      magicBytes[4] === 0x66 && // 'f'
      magicBytes[5] === 0x74 && // 't'
      magicBytes[6] === 0x79 && // 'y'
      magicBytes[7] === 0x70 && // 'p'
      ((magicBytes[8] === 0x68 &&
        magicBytes[9] === 0x65 &&
        magicBytes[10] === 0x69 &&
        magicBytes[11] === 0x63) || // heic
        (magicBytes[8] === 0x68 &&
          magicBytes[9] === 0x65 &&
          magicBytes[10] === 0x69 &&
          magicBytes[11] === 0x78) || // heix
        (magicBytes[8] === 0x68 &&
          magicBytes[9] === 0x65 &&
          magicBytes[10] === 0x76 &&
          magicBytes[11] === 0x63) || // hevc
        (magicBytes[8] === 0x68 &&
          magicBytes[9] === 0x65 &&
          magicBytes[10] === 0x76 &&
          magicBytes[11] === 0x78) || // hevx
        (magicBytes[8] === 0x68 &&
          magicBytes[9] === 0x65 &&
          magicBytes[10] === 0x69 &&
          magicBytes[11] === 0x6d) || // heim
        (magicBytes[8] === 0x68 &&
          magicBytes[9] === 0x65 &&
          magicBytes[10] === 0x69 &&
          magicBytes[11] === 0x73) || // heis
        (magicBytes[8] === 0x68 &&
          magicBytes[9] === 0x65 &&
          magicBytes[10] === 0x76 &&
          magicBytes[11] === 0x6d) || // hevm
        (magicBytes[8] === 0x68 &&
          magicBytes[9] === 0x65 &&
          magicBytes[10] === 0x76 &&
          magicBytes[11] === 0x73)); // hevs

    if (!isJPEG && !isPNG && !isWebP && !isHEIC) {
      console.error("Upload error: Invalid magic bytes", {
        magicBytes: Array.from(magicBytes.slice(0, 8)).map((b) => b.toString(16)),
      });
      return NextResponse.json(
        { error: "Invalid file. The file is not a valid image" },
        { status: 400 }
      );
    }

    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
    });

    const result = await new Promise((resolve, reject) => {
      // Increase timeout to 60 seconds for mobile devices with slower connections
      const timeout = setTimeout(() => reject(new Error("Upload timeout")), 60000);

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
