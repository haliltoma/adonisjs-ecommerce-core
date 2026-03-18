import { defineConfig } from '@japa/runner'

export default defineConfig({
  files: ['tests/**/*.spec.ts'],
  timeout: 30000,
  plugins: ['assert', () => import('@japa/plugin-adonisjs')],
  hooks: [],
  retry: 0,
  showErrorModal: true,
  forceExit: true,
})