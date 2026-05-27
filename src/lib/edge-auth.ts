import { cookies } from "next/headers";

export async function getEdgeSession(): Promise<{ id: string; username: string } | null> {
  const cookieStore = await cookies();

  // Use the custom token cookie (regular JWT, not encrypted)
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    // Decode JWT without verification (edge-compatible)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));

    if (payload.id) {
      return {
        id: payload.id,
        username: payload.username || "admin",
      };
    }

    return null;
  } catch {
    return null;
  }
}
