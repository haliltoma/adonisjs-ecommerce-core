/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css';
import { hydrateRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

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
    hydrateRoot(el, <App {...props} />)
  },

  defaults: {
    visitOptions: (_href, options) => {
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
      if (token) {
        return {
          headers: {
            ...options.headers,
            'x-csrf-token': token,
          },
        }
      }
      return {}
    },
  },
});