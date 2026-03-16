/**
 * String Helpers
 */

/**
 * Generate a random alphanumeric string of the given length
 */
export function random(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  const charMap: Record<string, string> = {
    ş: 's', ç: 'c', ğ: 'g', ü: 'u', ö: 'o', ı: 'i',
    Ş: 's', Ç: 'c', Ğ: 'g', Ü: 'u', Ö: 'o', İ: 'i',
  }
  return text
    .split('')
    .map((char) => charMap[char] || char)
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncate a string to a given length
 */
export function truncate(text: string, length: number = 100, suffix: string = '...'): string {
  if (text.length <= length) return text
  return text.slice(0, length - suffix.length) + suffix
}

/**
 * Capitalize the first letter of each word
 */
export function titleCase(text: string): string {
  return text.replace(/\b\w/g, (c) => c.toUpperCase())
}
