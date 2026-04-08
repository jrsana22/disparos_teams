import type {
  EvolutionConnectionState,
  EvolutionGroup,
  SendTextPayload,
  SendMediaPayload,
} from '@/types'

export class EvolutionAPI {
  private baseUrl: string
  private apiKey: string
  private instanceName: string

  constructor(baseUrl: string, apiKey: string, instanceName: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.apiKey = apiKey
    this.instanceName = instanceName
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Evolution API error ${response.status}: ${error}`)
    }

    return response.json()
  }

  async getConnectionState(): Promise<EvolutionConnectionState> {
    return this.request<EvolutionConnectionState>(
      `/instance/connectionState/${this.instanceName}`
    )
  }

  async isConnected(): Promise<boolean> {
    try {
      const state = await this.getConnectionState()
      return state.instance.state === 'open'
    } catch {
      return false
    }
  }

  async fetchAllGroups(): Promise<EvolutionGroup[]> {
    const response = await this.request<{ groups: EvolutionGroup[] } | EvolutionGroup[]>(
      `/group/fetchAllGroups/${this.instanceName}?getParticipants=false`
    )
    // API may return array directly or wrapped
    if (Array.isArray(response)) return response
    if ('groups' in response) return response.groups
    return []
  }

  async sendText(payload: SendTextPayload): Promise<unknown> {
    return this.request(`/message/sendText/${this.instanceName}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async sendMedia(payload: SendMediaPayload): Promise<unknown> {
    return this.request(`/message/sendMedia/${this.instanceName}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async sendAudio(number: string, audio: string): Promise<unknown> {
    return this.request(`/message/sendWhatsAppAudio/${this.instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        number,
        audio,
        encoding: true,
      }),
    })
  }

  async sendToGroup(
    groupId: string,
    type: string,
    content: string | null,
    mediaUrl: string | null,
    mediaCaption: string | null
  ): Promise<void> {
    switch (type) {
      case 'TEXT':
        await this.sendText({ number: groupId, text: content || '' })
        break
      case 'IMAGE':
        await this.sendMedia({
          number: groupId,
          mediatype: 'image',
          mimetype: 'image/jpeg',
          caption: mediaCaption || undefined,
          media: mediaUrl || '',
        })
        break
      case 'PDF':
        await this.sendMedia({
          number: groupId,
          mediatype: 'document',
          mimetype: 'application/pdf',
          caption: mediaCaption || undefined,
          media: mediaUrl || '',
          fileName: 'documento.pdf',
        })
        break
      case 'AUDIO':
        await this.sendAudio(groupId, mediaUrl || '')
        break
      case 'MIXED':
        if (mediaUrl) {
          await this.sendMedia({
            number: groupId,
            mediatype: 'image',
            mimetype: 'image/jpeg',
            caption: content || mediaCaption || undefined,
            media: mediaUrl,
          })
        } else if (content) {
          await this.sendText({ number: groupId, text: content })
        }
        break
      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  }
}

export async function getEvolutionAPIForUser(userId: string): Promise<EvolutionAPI | null> {
  const { prisma } = await import('@/lib/prisma')
  const instance = await prisma.instance.findUnique({
    where: { userId },
  })

  if (!instance) return null

  return new EvolutionAPI(instance.apiUrl, instance.apiKey, instance.instanceName)
}
