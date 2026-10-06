import { CircleAlert, RotateCcw } from 'lucide-react'
import type { ApiError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useI18n } from '@/i18n/useI18n'

/** Error block for a failed public request, with a retry. */
export function QueryError({ error, onRetry, tone = 'default' }: { error?: ApiError; onRetry: () => void; tone?: 'default' | 'inverse' }) {
  const { t } = useI18n()
  return (
    <EmptyState
      tone={tone}
      icon={<CircleAlert />}
      title={t.common.errorTitle}
      description={error?.status === 0 ? error.message : t.common.errorText}
      action={
        <Button variant={tone === 'inverse' ? 'inverse' : 'outline'} onClick={onRetry} icon={<RotateCcw className="size-4" />}>
          {t.common.retry}
        </Button>
      }
    />
  )
}
