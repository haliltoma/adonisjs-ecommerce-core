import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/core/encryption'

export default defineConfig({
  /**
   * The default driver used by encryption.encrypt() and
   * encryption.decrypt() when no driver is explicitly specified.
   *
   * Using 'legacy' driver for backwards compatibility with AdonisJS v6.
   */
  default: 'legacy',

  list: {
    /**
     * Legacy driver: Compatible with AdonisJS v6 encrypted data.
     * This ensures existing encrypted cookies, sessions, and data
     * can still be decrypted after the upgrade.
     */
    legacy: drivers.legacy({
      keys: [env.get('APP_KEY')],
    }),

    /**
     * ChaCha20-Poly1305: Modern authenticated encryption.
     * Uncomment to use as default for new applications.
     */
    // chacha: drivers.chacha20poly1305({
    //   id: 'chacha',
    //   keys: [env.get('APP_KEY')],
    // }),
  },
})
