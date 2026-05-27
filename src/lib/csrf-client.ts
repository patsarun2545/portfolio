// Helper function to get CSRF token from cookie
export function getCSRFToken(): string {
  if (typeof document === "undefined") return "";
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf-token="))
    ?.split("=")[1];
  return csrfToken || "";
}

// Helper function to get public CSRF token from cookie
export function getPublicCSRFToken(): string {
  if (typeof document === "undefined") return "";
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("public-csrf-token="))
    ?.split("=")[1];
  return csrfToken || "";
}
