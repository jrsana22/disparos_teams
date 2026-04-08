import { Badge } from '@/components/ui/badge'
import { getStatusLabel } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
    DRAFT: 'secondary',
    SCHEDULED: 'default',
    SENT: 'success',
    FAILED: 'destructive',
    CANCELLED: 'outline',
  }

  return (
    <Badge variant={variants[status] || 'secondary'}>
      {getStatusLabel(status)}
    </Badge>
  )
}
