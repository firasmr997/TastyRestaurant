import { SearchX } from 'lucide-react'
import { Panel } from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export default function AdminNotFoundPage() {
  return (
    <Panel>
      <EmptyState
        icon={<SearchX />}
        title="Page not found"
        description="This part of the dashboard does not exist."
        action={<Button to="/admin">Back to the dashboard</Button>}
      />
    </Panel>
  )
}
