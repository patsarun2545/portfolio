import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { generatePublicCSRFToken } from "@/lib/csrf";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

// GET endpoint to generate public CSRF token
export async function GET() {
  const token = await generatePublicCSRFToken();
  return NextResponse.json({ csrfToken: token });
}

export async function POST(request: Request) {
  try {
    // Validate public CSRF token (check if token exists and is valid UUID format)
    const csrfToken = request.headers.get("x-csrf-token");
    if (
      !csrfToken ||
      !csrfToken.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    ) {
      return NextResponse.json({ message: "Invalid CSRF token" }, { status: 403 });
    }

    // Simple rate limiting based on IP
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = await checkRateLimit(ip); // 5 requests per minute

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Additional rate limiting based on email (3 messages per hour)
    const emailRateLimit = await checkRateLimit(`email:${validatedData.email}`);
    if (!emailRateLimit.success) {
      return NextResponse.json(
        { message: "Too many messages from this email. Please try again later." },
        { status: 429 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
      },
    });

    // Send email notification via EmailJS
    try {
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          accessToken: process.env.EMAILJS_PRIVATE_KEY,
          template_params: {
            name: validatedData.name,
            email: validatedData.email,
            subject: validatedData.subject,
            message: validatedData.message,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("EmailJS API error:", response.status, errorText);
      } else {
        console.log("EmailJS sent successfully");
      }
    } catch (error) {
      console.error("EmailJS fetch error:", error);
      // Don't throw error - data is already saved in DB
    }

    return NextResponse.json(
      { message: "Message sent successfully", id: contactMessage.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Failed to send message"
        : error instanceof Error
          ? error.message
          : String(error);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
