/**
 * ThemeService
 *
 * Manages storefront themes, design tokens, and component overrides.
 * Theme settings are persisted via the Settings model.
 */

import Setting from '#models/setting'

export interface ThemeConfig {
  name: string
  version: string
  description?: string
  author?: string
  colors: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    border: string
    success: string
    warning: string
    danger: string
  }
  fonts: {
    heading: string
    body: string
  }
  borderRadius: string
  layout: {
    headerStyle: 'sticky' | 'static' | 'transparent'
    footerColumns: number
    sidebarPosition: 'left' | 'right'
    productGridColumns: number
    showAnnouncementBar: boolean
  }
}

const DEFAULT_THEME: ThemeConfig = {
  name: 'Default',
  version: '1.0.0',
  description: 'AdonisCommerce default theme',
  colors: {
    primary: 'oklch(0.65 0.15 45)',
    primaryForeground: 'oklch(0.98 0.005 45)',
    secondary: 'oklch(0.55 0.1 45)',
    secondaryForeground: 'oklch(0.98 0.005 45)',
    accent: 'oklch(0.7 0.12 60)',
    accentForeground: 'oklch(0.2 0.02 45)',
    background: 'oklch(0.99 0.002 90)',
    foreground: 'oklch(0.15 0.02 45)',
    muted: 'oklch(0.95 0.005 90)',
    mutedForeground: 'oklch(0.45 0.02 45)',
    border: 'oklch(0.9 0.005 90)',
    success: 'oklch(0.65 0.15 145)',
    warning: 'oklch(0.75 0.15 80)',
    danger: 'oklch(0.6 0.2 25)',
  },
  fonts: {
    heading: '"DM Serif Display", Georgia, serif',
    body: '"DM Sans", system-ui, sans-serif',
  },
  borderRadius: '0.5rem',
  layout: {
    headerStyle: 'sticky',
    footerColumns: 4,
    sidebarPosition: 'left',
    productGridColumns: 4,
    showAnnouncementBar: true,
  },
}

export default class ThemeService {
  /**
   * Get the active theme configuration for a store
   */
  async getTheme(storeId: string): Promise<ThemeConfig> {
    const setting = await Setting.query()
      .where('storeId', storeId)
      .where('group', 'theme')
      .where('key', 'config')
      .first()

    if (!setting) return { ...DEFAULT_THEME }

    const stored = setting.getTypedValue() as Partial<ThemeConfig>
    return { ...DEFAULT_THEME, ...stored }
  }

  /**
   * Save theme configuration for a store
   */
  async saveTheme(storeId: string, config: Partial<ThemeConfig>): Promise<void> {
    const existing = await Setting.query()
      .where('storeId', storeId)
      .where('group', 'theme')
      .where('key', 'config')
      .first()

    const merged = { ...DEFAULT_THEME, ...config }

    if (existing) {
      existing.value = JSON.stringify(merged)
      await existing.save()
    } else {
      await Setting.create({
        storeId,
        group: 'theme',
        key: 'config',
        value: JSON.stringify(merged),
        type: 'json',
        isPublic: true,
      })
    }
  }

  /**
   * Reset theme to defaults
   */
  async resetTheme(storeId: string): Promise<void> {
    await Setting.query()
      .where('storeId', storeId)
      .where('group', 'theme')
      .delete()
  }

  /**
   * Generate CSS custom properties from theme config
   */
  generateCSSVariables(config: ThemeConfig): string {
    const vars = [
      `--color-primary: ${config.colors.primary};`,
      `--color-primary-foreground: ${config.colors.primaryForeground};`,
      `--color-secondary: ${config.colors.secondary};`,
      `--color-secondary-foreground: ${config.colors.secondaryForeground};`,
      `--color-accent: ${config.colors.accent};`,
      `--color-accent-foreground: ${config.colors.accentForeground};`,
      `--color-background: ${config.colors.background};`,
      `--color-foreground: ${config.colors.foreground};`,
      `--color-muted: ${config.colors.muted};`,
      `--color-muted-foreground: ${config.colors.mutedForeground};`,
      `--color-border: ${config.colors.border};`,
      `--color-success: ${config.colors.success};`,
      `--color-warning: ${config.colors.warning};`,
      `--color-danger: ${config.colors.danger};`,
      `--font-heading: ${config.fonts.heading};`,
      `--font-body: ${config.fonts.body};`,
      `--radius: ${config.borderRadius};`,
    ]

    return `:root {\n  ${vars.join('\n  ')}\n}`
  }

  /**
   * Get the default theme config
   */
  getDefaultTheme(): ThemeConfig {
    return { ...DEFAULT_THEME }
  }
}
