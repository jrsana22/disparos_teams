import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateOnly(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Rascunho',
    SCHEDULED: 'Agendado',
    SENT: 'Enviado',
    FAILED: 'Falha',
    CANCELLED: 'Cancelado',
  }
  return labels[status] || status
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    TEXT: 'Texto',
    IMAGE: 'Imagem',
    PDF: 'PDF',
    AUDIO: 'Áudio',
    MIXED: 'Combinado',
  }
  return labels[type] || type
}

export function parseGroupIds(groupsJson: string): string[] {
  try {
    return JSON.parse(groupsJson)
  } catch {
    return []
  }
}
