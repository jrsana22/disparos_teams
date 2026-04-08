export interface EvolutionGroup {
  id: string
  subject: string
  subjectTime: number
  subjectOwner: string
  size: number
  owner: string
  desc?: string
  creation: number
  isCommunity: boolean
  isCommunityAnnounce: boolean
}

export interface EvolutionInstance {
  instance: {
    instanceName: string
    status: string
  }
  hash?: {
    apikey: string
  }
}

export interface EvolutionConnectionState {
  instance: {
    instanceName: string
    state: 'open' | 'connecting' | 'close'
  }
}

export interface SendTextPayload {
  number: string
  text: string
  delay?: number
}

export interface SendMediaPayload {
  number: string
  mediatype: 'image' | 'document' | 'audio' | 'video'
  mimetype: string
  caption?: string
  media: string // base64 or URL
  fileName?: string
}

export interface CampaignWithGroups {
  id: string
  name: string
  groups: string[]
  scheduledAt: Date
  timezone: string
  type: string
  content: string | null
  mediaUrl: string | null
  mediaCaption: string | null
  status: string
  repeat: string
  delaySeconds: number
  createdAt: Date
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface DashboardStats {
  totalScheduled: number
  totalSent: number
  totalFailed: number
  totalDraft: number
}

export interface ChartData {
  date: string
  enviados: number
  falhas: number
}
