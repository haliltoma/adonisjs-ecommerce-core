/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css';
import { createRoot } from 'react-dom/client'
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { updateCsrfMeta } from '@/lib/csrf'

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

createInertiaApp({
  progress: { color: '#d4872e' },

  title: (title) => `${title} - ${appName}`,

  resolve: (name) => {
    return resolvePageComponent(
      `../pages/${name}.tsx`,
      import.meta.glob('../pages/**/*.tsx'),
    )
  },

  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },

  // Axios (used by Inertia) automatically reads the XSRF-TOKEN cookie
  // and sends it as X-XSRF-TOKEN header on every same-origin request.
  // No manual header injection is needed.
});

// ── Keep CSRF meta tag in sync after every Inertia navigation ──
// The server sends a fresh csrfToken in shared props on every response.
router.on('success', (event) => {
  const csrfToken = (event.detail.page.props as any)?.csrfToken
  if (csrfToken) {
    updateCsrfMeta(csrfToken)
  }
})

// ── Auto-retry on CSRF failure ──
// If a 403 comes back because the token expired, refresh token from cookie
// and retry the visit once. The user sees no interruption.
let isRetrying = false
router.on('invalid', (event) => {
  const response = event.detail.response
  if (response.status === 419 || response.status === 403) {
    if (!isRetrying) {
      isRetrying = true
      event.preventDefault()
      // The server's 403/419 response likely set a fresh XSRF-TOKEN cookie.
      // Retry the current page visit to pick it up.
      router.reload({ onFinish: () => { isRetrying = false } })
    }
  }
})
