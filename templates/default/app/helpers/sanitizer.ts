/**
 * Sanitizer Helper
 *
 * Provides HTML sanitization for user-submitted rich text content.
 * Strips dangerous tags and attributes while preserving safe formatting.
 */

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span', 'hr',
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height', 'title']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
  '*': new Set(['class', 'id']),
}

const DANGEROUS_PROTOCOLS = ['javascript:', 'vbscript:', 'data:text/html']

export class Sanitizer {
  /**
   * Sanitize HTML string by removing dangerous content
   */
  static sanitizeHtml(html: string): string {
    if (!html) return ''

    // Remove script tags and their content
    let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

    // Remove style tags and their content
    clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

    // Remove event handlers (onclick, onerror, etc.)
    clean = clean.replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, '')
    clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '')

    // Remove dangerous protocol links
    for (const protocol of DANGEROUS_PROTOCOLS) {
      const regex = new RegExp(`href\\s*=\\s*(['"]?)\\s*${protocol.replace(':', '\\:')}`, 'gi')
      clean = clean.replace(regex, 'href=$1#')
    }

    // Remove tags not in allowlist
    clean = clean.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
      const tagLower = tag.toLowerCase()
      if (!ALLOWED_TAGS.has(tagLower)) return ''
      return match
    })

    return clean.trim()
  }

  /**
   * Strip all HTML tags from a string
   */
  static stripTags(html: string): string {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').trim()
  }

  /**
   * Escape HTML entities
   */
  static escapeHtml(str: string): string {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  /**
   * Sanitize a URL - only allow safe protocols
   */
  static sanitizeUrl(url: string): string {
    if (!url) return ''

    const trimmed = url.trim().toLowerCase()
    for (const protocol of DANGEROUS_PROTOCOLS) {
      if (trimmed.startsWith(protocol)) {
        return '#'
      }
    }

    return url.trim()
  }

  /**
   * Sanitize a filename to prevent directory traversal
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+/, '')
  }
}

// Keep allowed tags/attrs exported for reference
export { ALLOWED_TAGS, ALLOWED_ATTRS }
