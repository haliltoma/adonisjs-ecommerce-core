/**
 * TranslationService
 *
 * Manages polymorphic translations for any translatable entity
 * (products, categories, pages, etc.).
 */

import Translation from '#models/translation'
import Locale from '#models/locale'
import { randomUUID } from 'node:crypto'

interface TranslationData {
  field: string
  value: string
}

export default class TranslationService {
  /**
   * Get all translations for a specific entity and locale
   */
  async getTranslations(
    translatableType: string,
    translatableId: string,
    localeCode: string
  ): Promise<Record<string, string>> {
    const locale = await Locale.query().where('code', localeCode).first()
    if (!locale) return {}

    const translations = await Translation.query()
      .where('translatableType', translatableType)
      .where('translatableId', translatableId)
      .where('localeId', locale.id)

    const result: Record<string, string> = {}
    for (const t of translations) {
      result[t.field] = t.value
    }
    return result
  }

  /**
   * Get translations for a specific entity across all locales
   */
  async getAllTranslations(
    translatableType: string,
    translatableId: string
  ): Promise<Record<string, Record<string, string>>> {
    const translations = await Translation.query()
      .where('translatableType', translatableType)
      .where('translatableId', translatableId)
      .preload('locale')

    const result: Record<string, Record<string, string>> = {}
    for (const t of translations) {
      const localeCode = t.locale?.code || t.localeId
      if (!result[localeCode]) {
        result[localeCode] = {}
      }
      result[localeCode][t.field] = t.value
    }
    return result
  }

  /**
   * Set translations for an entity in a specific locale
   */
  async setTranslations(
    translatableType: string,
    translatableId: string,
    localeCode: string,
    data: TranslationData[]
  ): Promise<void> {
    const locale = await Locale.query().where('code', localeCode).first()
    if (!locale) throw new Error(`Locale "${localeCode}" not found`)

    for (const item of data) {
      const existing = await Translation.query()
        .where('translatableType', translatableType)
        .where('translatableId', translatableId)
        .where('localeId', locale.id)
        .where('field', item.field)
        .first()

      if (existing) {
        existing.value = item.value
        await existing.save()
      } else {
        await Translation.create({
          id: randomUUID(),
          localeId: locale.id,
          translatableType,
          translatableId,
          field: item.field,
          value: item.value,
        })
      }
    }
  }

  /**
   * Delete all translations for a specific entity
   */
  async deleteTranslations(
    translatableType: string,
    translatableId: string
  ): Promise<void> {
    await Translation.query()
      .where('translatableType', translatableType)
      .where('translatableId', translatableId)
      .delete()
  }

  /**
   * Delete translations for a specific entity and locale
   */
  async deleteLocaleTranslations(
    translatableType: string,
    translatableId: string,
    localeCode: string
  ): Promise<void> {
    const locale = await Locale.query().where('code', localeCode).first()
    if (!locale) return

    await Translation.query()
      .where('translatableType', translatableType)
      .where('translatableId', translatableId)
      .where('localeId', locale.id)
      .delete()
  }

  /**
   * Get translated value for a field, falling back to the original value
   */
  async getTranslatedField(
    translatableType: string,
    translatableId: string,
    field: string,
    localeCode: string,
    fallback: string
  ): Promise<string> {
    const locale = await Locale.query().where('code', localeCode).first()
    if (!locale) return fallback

    const translation = await Translation.query()
      .where('translatableType', translatableType)
      .where('translatableId', translatableId)
      .where('localeId', locale.id)
      .where('field', field)
      .first()

    return translation?.value || fallback
  }

  /**
   * Bulk translate multiple entities at once
   */
  async bulkSetTranslations(
    translatableType: string,
    localeCode: string,
    items: { translatableId: string; data: TranslationData[] }[]
  ): Promise<void> {
    for (const item of items) {
      await this.setTranslations(translatableType, item.translatableId, localeCode, item.data)
    }
  }

  /**
   * Get active locales for a store
   */
  async getActiveLocales(storeId: string) {
    return Locale.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .orderBy('isDefault', 'desc')
      .orderBy('name', 'asc')
  }
}
