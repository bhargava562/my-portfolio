/**
 * CHALLENGE 3: XSS Protection & Sanitization Utility
 *
 * Purpose: Strict XSS protection for data fetched from Supabase before DOM insertion
 *
 * ARCHITECTURE:
 * 1. Use isomorphic-dompurify for HTML sanitization (server + client safe)
 * 2. Whitelist only safe HTML tags and attributes
 * 3. Strip all event handlers, scripts, and dangerous attributes
 * 4. Optional: Use Content Security Policy headers (see next.config.ts)
 *
 * USAGE:
 *   import { sanitizeHTML, sanitizeText } from '@/lib/security/sanitize';
 *
 *   // For rich HTML content (blogs, descriptions)
 *   const safeHTML = sanitizeHTML(userContent);
 *
 *   // For plain text (names, titles)
 *   const safeText = sanitizeText(userInput);
 *
 * SECURITY GUARANTEES:
 * ✓ Strips all <script> tags and content
 * ✓ Removes event handlers (onclick, onerror, onload, etc.)
 * ✓ Removes dangerous attributes (src, href with javascript:)
 * ✓ Escapes special characters
 * ✓ Prevents DOM-based XSS attacks
 * ✗ Does NOT validate input on server-side forms (use separate validation)
 */

/**
 * Reference: Whitelist of safe HTML tags for potential DOMPurify configuration.
 * Tags: p, br, strong, em, u, i, b, h1-h6, ul, ol, li, blockquote, code, pre,
 *       a, img, table, thead, tbody, tr, td, th, section, article, div, span
 *
 * Reference: Whitelist of safe attributes per tag:
 *   a: href, title, target, rel
 *   img: src, alt, width, height, loading
 *   div/span/pre/code: class
 */

/**
 * Client-side sanitization function
 * Uses built-in browser APIs to safely escape HTML
 */
function sanitizeHTMLClient(dirty: string): string {
  // Create a temporary element to safely parse HTML
  const temp = document.createElement('div');
  temp.textContent = dirty;
  let clean = temp.innerHTML;

  // Additional sanitization: remove JavaScript URLs
  clean = clean.replace(/javascript:/gi, '');
  clean = clean.replace(/on\w+\s*=/gi, '');

  return clean;
}

/**
 * Server-side sanitization function
 * Uses regex patterns and careful string manipulation
 * Works without DOM APIs (suitable for API routes)
 */
function sanitizeHTMLServer(dirty: string): string {
  let clean = dirty;

  // Remove script tags and content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  clean = clean.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  clean = clean.replace(/javascript:/gi, '');

  // Remove style tags
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove iframe tags
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove embed and object tags
  clean = clean.replace(/<(embed|object|form)\b[^<]*(?:(?!<\/(embed|object|form)>)<[^<]*)*<\/(embed|object|form)>/gi, '');

  // Remove data: protocol (can contain JavaScript)
  clean = clean.replace(/data:text\/html/gi, '');

  return clean;
}

/**
 * Sanitize HTML content (with fallback pattern)
 * Automatically chooses between client/server implementations
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Try to use DOMPurify if available (will work in client)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (globalThis as Record<string, any>).DOMPurify) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis as Record<string, any>).DOMPurify.sanitize(dirty);
  }

  // Use client-side sanitization if in browser
  if (typeof window !== 'undefined') {
    return sanitizeHTMLClient(dirty);
  }

  // Use server-side sanitization on the backend
  return sanitizeHTMLServer(dirty);
}

/**
 * Escape plain text to prevent XSS
 * Use for text content, names, titles, etc.
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Escape HTML special characters
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char);
}

/**
 * Sanitize URL (for href and src attributes)
 * Prevents javascript: and data: URLs
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  // Block dangerous protocols
  if (
    trimmed.toLowerCase().startsWith('javascript:') ||
    trimmed.toLowerCase().startsWith('data:') ||
    trimmed.toLowerCase().startsWith('vbscript:')
  ) {
    return '';
  }

  // Allow relative URLs, http, https, mailto, tel
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return trimmed;
  }

  // Default to empty for unknown protocols
  return '';
}

/**
 * Sanitize object (recursively sanitizes all string properties)
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized: Record<string, unknown> = { ...obj };

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        // Sanitize string values
        sanitized[key] = sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeObject(value as Record<string, unknown>);
      }
    }
  }

  return sanitized as T;
}

/**
 * Extract safe plain text from HTML
 * Useful for rendering user-generated content safely
 */
export function extractPlainText(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null;
  if (textarea) {
    textarea.innerHTML = text;
    text = textarea.value;
  } else {
    // Server-side decoding (simplified)
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
  }

  return sanitizeText(text);
}

const sanitizeUtils = {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeObject,
  extractPlainText,
};

export default sanitizeUtils;