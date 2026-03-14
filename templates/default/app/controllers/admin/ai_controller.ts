import type { HttpContext } from '@adonisjs/core/http'
import AiService from '#services/ai_service'
import StoreService from '#services/store_service'

export default class AiController {
  private aiService: AiService
  private storeService: StoreService

  constructor() {
    this.aiService = new AiService()
    this.storeService = new StoreService()
  }

  private async getAiConfig(storeId: string) {
    const enabled = await this.storeService.getSetting(storeId, 'ai', 'enabled')
    if (!enabled || enabled !== true) {
      return null
    }

    const provider = await this.storeService.getSetting(storeId, 'ai', 'provider') as string | null
    const model = await this.storeService.getSetting(storeId, 'ai', 'model') as string | null
    const apiKey = await this.storeService.getSetting(storeId, 'ai', 'apiKey') as string | null
    const baseUrl = await this.storeService.getSetting(storeId, 'ai', 'baseUrl') as string | null

    if (!provider || !apiKey) {
      return null
    }

    return {
      provider: provider as 'openai' | 'anthropic' | 'custom',
      model: model || 'gpt-4o',
      apiKey,
      baseUrl: baseUrl || undefined,
    }
  }

  async generate({ request, response, store }: HttpContext) {
    const config = await this.getAiConfig(store.id)
    if (!config) {
      return response.unprocessableEntity({
        error: 'AI is not configured. Please configure AI settings first.',
      })
    }

    const prompt = request.input('prompt')
    if (!prompt) {
      return response.badRequest({ error: 'Prompt is required' })
    }

    try {
      const systemPrompt = this.aiService.buildComponentSystemPrompt()
      const result = await this.aiService.callAiProvider({
        ...config,
        systemPrompt,
        userPrompt: prompt,
      })

      // Try to parse the JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return response.unprocessableEntity({ error: 'AI did not return valid component JSON' })
      }

      const parsed = JSON.parse(jsonMatch[0])
      return response.json({ success: true, data: parsed })
    } catch (err: any) {
      return response.internalServerError({
        error: err?.message || 'AI generation failed',
      })
    }
  }

  async imageToComponent({ request, response, store }: HttpContext) {
    const config = await this.getAiConfig(store.id)
    if (!config) {
      return response.unprocessableEntity({
        error: 'AI is not configured. Please configure AI settings first.',
      })
    }

    const image = request.file('image', {
      size: '10mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    })

    if (!image) {
      return response.badRequest({ error: 'Image file is required' })
    }

    try {
      const imageBuffer = await import('node:fs').then((fs) =>
        fs.promises.readFile(image.tmpPath!)
      )
      const imageBase64 = imageBuffer.toString('base64')
      const imageMimeType = `image/${image.extname === 'jpg' ? 'jpeg' : image.extname}`

      const systemPrompt = this.aiService.buildComponentSystemPrompt()
      const result = await this.aiService.callAiProviderWithVision({
        ...config,
        systemPrompt,
        userPrompt: 'Analyze this screenshot/design and generate Puck components that recreate this layout as closely as possible. Use appropriate components from the available set.',
        imageBase64,
        imageMimeType,
      })

      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return response.unprocessableEntity({ error: 'AI did not return valid component JSON' })
      }

      const parsed = JSON.parse(jsonMatch[0])
      return response.json({ success: true, data: parsed })
    } catch (err: any) {
      return response.internalServerError({
        error: err?.message || 'Image analysis failed',
      })
    }
  }
}
