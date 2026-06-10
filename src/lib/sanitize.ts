import sanitizeHtml from "sanitize-html";

/**
 * Sanitize text content by stripping all HTML tags
 * Use this for user-provided text that should not contain HTML
 */
export function sanitizeText(text: string): string {
  // Use a simple regex to remove HTML tags without encoding entities
  // This preserves special characters like &, <, > in plain text
  return text.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize HTML content while allowing basic formatting tags
 * Use this for rich text content like blog posts
 */
export function sanitizeHTML(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
  });
}
