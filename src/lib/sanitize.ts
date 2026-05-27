import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize text content by stripping all HTML tags
 * Use this for user-provided text that should not contain HTML
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize HTML content while allowing basic formatting tags
 * Use this for rich text content like blog posts
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}
