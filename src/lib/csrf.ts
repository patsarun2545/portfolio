import { cookies } from "next/headers";

// Generate a CSRF token (httpOnly for admin)
export async function generateCSRFToken(): Promise<string> {
  const token = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("csrf-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });
  return token;
}

// Generate a public CSRF token (non-httpOnly for public forms)
export async function generatePublicCSRFToken(): Promise<string> {
  const token = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("public-csrf-token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });
  return token;
}

// Validate a CSRF token
export async function validateCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get("csrf-token")?.value;
  const isValid = storedToken === token && storedToken !== "";

  // Rotate token after successful validation
  if (isValid) {
    await generateCSRFToken();
  }

  return isValid;
}

// Validate a public CSRF token
export async function validatePublicCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get("public-csrf-token")?.value;
  const isValid = storedToken === token && storedToken !== "";

  // Don't rotate token for public forms to avoid client-side sync issues
  return isValid;
}
