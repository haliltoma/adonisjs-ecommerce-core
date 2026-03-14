interface AiProviderConfig {
  provider: 'openai' | 'anthropic' | 'custom'
  apiKey: string
  model: string
  baseUrl?: string
}

interface AiCallOptions extends AiProviderConfig {
  systemPrompt: string
  userPrompt: string
}

interface AiCallWithVisionOptions extends AiCallOptions {
  imageBase64: string
  imageMimeType: string
}

export default class AiService {
  async callAiProvider(options: AiCallOptions): Promise<string> {
    const { provider, apiKey, model, baseUrl, systemPrompt, userPrompt } = options

    if (provider === 'anthropic') {
      return this.callAnthropic({ apiKey, model, baseUrl, systemPrompt, userPrompt })
    }

    // OpenAI-compatible (works for openai + custom)
    return this.callOpenAiCompatible({ apiKey, model, baseUrl, systemPrompt, userPrompt })
  }

  async callAiProviderWithVision(options: AiCallWithVisionOptions): Promise<string> {
    const { provider, apiKey, model, baseUrl, systemPrompt, userPrompt, imageBase64, imageMimeType } = options

    if (provider === 'anthropic') {
      return this.callAnthropicWithVision({ apiKey, model, baseUrl, systemPrompt, userPrompt, imageBase64, imageMimeType })
    }

    return this.callOpenAiCompatibleWithVision({ apiKey, model, baseUrl, systemPrompt, userPrompt, imageBase64, imageMimeType })
  }

  buildComponentSystemPrompt(): string {
    return `You are a web page component generator. You generate Puck editor component JSON based on user descriptions or screenshots.

Available components and their props:

LAYOUT:
- Container: { maxWidth: "sm"|"md"|"lg"|"xl"|"full", padding: "none"|"sm"|"md"|"lg"|"xl", background: "none"|"white"|"gray"|"dark"|"primary" }
- Columns: { columns: "2"|"3"|"4"|"2-1"|"1-2", gap: "none"|"sm"|"md"|"lg" }
- Spacer: { size: "xs"|"sm"|"md"|"lg"|"xl"|"2xl" }
- Divider: { style: "solid"|"dashed"|"dotted" }

TYPOGRAPHY:
- Heading: { text: string, level: "h1"|"h2"|"h3"|"h4", align: "left"|"center"|"right" }
- Text: { text: string, size: "sm"|"base"|"lg"|"xl", align: "left"|"center"|"right", color: "default"|"muted"|"primary" }
- RichText: { html: string }

MEDIA:
- Image: { src: string, alt: string, aspectRatio: "auto"|"16/9"|"4/3"|"1/1"|"3/4", rounded: "none"|"sm"|"md"|"lg"|"full" }
- Video: { url: string, aspectRatio: "16/9"|"4/3"|"1/1" }
- ImageGallery: { images: string (newline-separated URLs), columns: "2"|"3"|"4" }

COMMERCE:
- ProductGrid: { title: string, subtitle: string, count: "3"|"4"|"6"|"8", source: "featured"|"newest"|"best-selling"|"on-sale" }
- FeaturedProduct: { layout: "left"|"right", title: string, description: string, imageUrl: string, buttonText: string, buttonUrl: string }
- CategoryGrid: { title: string, columns: "2"|"3"|"4" }
- CtaBanner: { title: string, description: string, buttonText: string, buttonUrl: string, variant: "dark"|"light"|"gradient" }

INTERACTIVE:
- ButtonGroup: { buttons: string (format: "Label|/url" per line), align: "left"|"center"|"right" }
- Accordion: { items: string (format: "Question|Answer" per line) }
- Testimonials: { items: string (format: "Title|Author|Text" per line), columns: "2"|"3" }
- ContactForm: { title: string, description: string, submitText: string }

Output ONLY valid JSON in this format (no markdown, no explanation):
{
  "content": [
    {
      "type": "ComponentName",
      "props": { ...componentProps, "id": "unique-id-1" }
    }
  ],
  "root": {}
}

Generate unique IDs for each component (e.g., "comp-1", "comp-2", etc.).
Use realistic placeholder content. Make the layout look professional.`
  }

  private async callOpenAiCompatible(options: Omit<AiCallOptions, 'provider'>): Promise<string> {
    const { apiKey, model, baseUrl, systemPrompt, userPrompt } = options
    const url = `${baseUrl || 'https://api.openai.com/v1'}/chat/completions`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${error}`)
    }

    const data: any = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  private async callOpenAiCompatibleWithVision(options: Omit<AiCallWithVisionOptions, 'provider'>): Promise<string> {
    const { apiKey, model, baseUrl, systemPrompt, userPrompt, imageBase64, imageMimeType } = options
    const url = `${baseUrl || 'https://api.openai.com/v1'}/chat/completions`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: { url: `data:${imageMimeType};base64,${imageBase64}` },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI Vision API error: ${response.status} - ${error}`)
    }

    const data: any = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  private async callAnthropic(options: Omit<AiCallOptions, 'provider'>): Promise<string> {
    const { apiKey, model, baseUrl, systemPrompt, userPrompt } = options
    const url = `${baseUrl || 'https://api.anthropic.com'}/v1/messages`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${response.status} - ${error}`)
    }

    const data: any = await response.json()
    const textBlock = data.content?.find((b: any) => b.type === 'text')
    return textBlock?.text || ''
  }

  private async callAnthropicWithVision(options: Omit<AiCallWithVisionOptions, 'provider'>): Promise<string> {
    const { apiKey, model, baseUrl, systemPrompt, userPrompt, imageBase64, imageMimeType } = options
    const url = `${baseUrl || 'https://api.anthropic.com'}/v1/messages`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageMimeType,
                  data: imageBase64,
                },
              },
              { type: 'text', text: userPrompt },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic Vision API error: ${response.status} - ${error}`)
    }

    const data: any = await response.json()
    const textBlock = data.content?.find((b: any) => b.type === 'text')
    return textBlock?.text || ''
  }
}
