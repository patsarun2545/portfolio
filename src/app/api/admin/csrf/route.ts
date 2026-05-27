import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateCSRFToken } from "@/lib/csrf";

export async function POST() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = await generateCSRFToken();
    return NextResponse.json({ token });
  } catch (error) {
    console.error("CSRF token generation failed:", error);
    return NextResponse.json({ error: "Failed to generate CSRF token" }, { status: 500 });
  }
}
