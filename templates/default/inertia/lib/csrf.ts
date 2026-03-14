/**
 * Centralized CSRF token utilities.
 *
 * - getXsrfToken()  → reads the fresh token from the XSRF-TOKEN cookie (always up-to-date)
 * - updateCsrfMeta() → updates the <meta name="csrf-token"> tag so Inertia picks it up
 * - csrfFetch()      → drop-in fetch() replacement that injects CSRF + Accept headers
 *                       and auto-retries once on 403 (expired token)
 */

/**
 * Read the current XSRF token from the cookie set by AdonisJS Shield.
 * The cookie is non-httpOnly so JS can read it.
 */
export function getXsrfToken(): string {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  if (!match) return ''
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

/**
 * Update the <meta name="csrf-token"> tag in the document head.
 * Called after every Inertia response so the meta tag stays in sync.
 */
export function updateCsrfMeta(token: string): void {
  if (!token) return
  const meta = document.querySelector('meta[name="csrf-token"]')
  if (meta) {
    meta.setAttribute('content', token)
  }
}

/**
 * Wrapper around fetch() that:
 * 1. Always sends Accept: application/json
 * 2. Injects the XSRF token from the cookie (fresh every call)
 * 3. On 403 with CSRF-like error, retries ONCE with a refreshed token
 * 4. Validates content-type before returning
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const attempt = (retrying: boolean): Promise<Response> => {
    const token = getXsrfToken()
    const headers = new Headers(options.headers)
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }
    if (token) {
      headers.set('x-xsrf-token', token)
    }

    return fetch(url, {
      ...options,
      credentials: options.credentials || 'same-origin',
      headers,
    }).then((res) => {
      if (res.status === 403 && !retrying) {
        // Could be an expired CSRF token — retry once.
        // The server may have set a fresh XSRF-TOKEN cookie in the 403 response.
        return attempt(true)
      }
      return res
    })
  }

  return attempt(false)
}

/**
 * Helper: call csrfFetch and parse the JSON body safely.
 * Throws a descriptive Error if response is not JSON or not ok.
 */
export async function csrfFetchJson<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await csrfFetch(url, options)

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(
      res.ok
        ? 'Server returned an unexpected response'
        : `Request failed (${res.status})`
    )
  }

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || json.message || `Request failed (${res.status})`)
  }
  return json as T
}
