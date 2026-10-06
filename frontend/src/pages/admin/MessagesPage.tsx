import { Archive, ArrowLeft, Inbox, Mail, MailOpen, Phone, Reply, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeader, Panel } from '@/components/admin/AdminUi'
import { UNREAD_KEY } from '@/hooks/useUnreadMessages'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { messageService } from '@/services/messageService'
import type { ContactMessage, MessageStatus } from '@/types/models'
import { cn } from '@/utils/cn'
import { formatDateTime, formatRelative } from '@/utils/format'

const TABS: { value: MessageStatus | ''; label: string }[] = [
  { value: '', label: 'Inbox' },
  { value: 'NEW', label: 'New' },
  { value: 'READ', label: 'Read' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export default function MessagesPage() {
  const [params, setParams] = useSearchParams()
  const toast = useToast()
  const confirm = useConfirm()
  const status = (params.get('status') ?? '') as MessageStatus | ''
  const openId = params.get('open') ? Number(params.get('open')) : null
  const [search, setSearch] = useState('')
  const q = useDebouncedValue(search.trim(), 300)
  const [page, setPage] = useState(0)

  useEffect(() => setPage(0), [status, q])

  const list = useQuery(
    `admin:messages:${status}:${q}:${page}`,
    (signal) => messageService.list({ status: status || undefined, q: q || undefined, page, size: 15 }, signal),
    { keepPrevious: true, staleTime: 5_000 },
  )
  const selected = list.data?.content.find((m) => m.id === openId)
  const detail = useQuery(openId && !selected ? `admin:messages:item:${openId}` : null, (signal) => messageService.get(openId!, signal))
  const message = selected ?? detail.data

  const refresh = () => {
    invalidateQueries('admin:messages')
    invalidateQueries(UNREAD_KEY)
    invalidateQueries('dashboard')
  }

  // Opening a new message marks it as read.
  useEffect(() => {
    if (message?.status !== 'NEW') return
    messageService
      .markRead(message.id)
      .then(refresh)
      .catch(() => undefined)
  }, [message?.id, message?.status])

  const select = (id: number | null) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (id) next.set('open', String(id))
      else next.delete('open')
      return next
    })
  }

  const setStatus = (value: MessageStatus | '') => {
    setParams(value ? { status: value } : {})
  }

  const act = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action()
      toast.success(success)
      refresh()
    } catch (err) {
      toast.error('Could not update the message', err instanceof Error ? err.message : undefined)
    }
  }

  const remove = (target: ContactMessage) =>
    confirm({
      title: 'Delete this message?',
      description: `The message from ${target.name} is deleted permanently. Archive it instead if you may need it later.`,
      confirmLabel: 'Delete message',
      action: async () => {
        try {
          await messageService.remove(target.id)
          toast.success('Message deleted')
          select(null)
          refresh()
        } catch (err) {
          toast.error('Could not delete the message', err instanceof Error ? err.message : undefined)
          throw err
        }
      },
    })

  const messages = list.data?.content ?? []

  return (
    <>
      <PageHeader title="Messages" description="Everything sent from the contact form. New messages are marked as read when you open them." />
      <div className="grid gap-6 xl:grid-cols-[minmax(22rem,26rem)_1fr]">
        <Panel className={cn('flex flex-col', openId !== null && 'hidden xl:flex')}>
          <div className="flex flex-col gap-3 border-b border-line p-4">
            <div role="tablist" aria-label="Message status" className="grid grid-cols-4 rounded-control border border-line bg-surface-2 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={status === tab.value}
                  onClick={() => setStatus(tab.value)}
                  className={cn(
                    'rounded-[0.45rem] py-1.5 text-sm font-semibold transition-colors',
                    status === tab.value ? 'bg-surface text-ink shadow-[0_1px_3px_rgb(12_20_16/0.12)]' : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <label htmlFor="message-search" className="sr-only">
                Search messages
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
              <input
                id="message-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or text"
                className="h-10 w-full rounded-control border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-ink-faint focus:border-focus focus:outline-none focus:ring-4 focus:ring-focus/20"
              />
            </div>
          </div>
          {list.isLoading && messages.length === 0 ? (
            <ul aria-hidden className="divide-y divide-line">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="flex flex-col gap-2 px-4 py-4">
                  <span className="skeleton h-4 w-1/2 rounded" />
                  <span className="skeleton h-3 w-full rounded" />
                </li>
              ))}
            </ul>
          ) : messages.length === 0 ? (
            <EmptyState icon={<Inbox />} title="No messages" description={q ? 'No message matches this search.' : status === 'ARCHIVED' ? 'Archived messages appear here.' : 'New messages from the contact form appear here.'} />
          ) : (
            <ul className="divide-y divide-line">
              {messages.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => select(m.id)}
                    aria-current={m.id === openId ? 'true' : undefined}
                    className={cn('flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors hover:bg-surface-2', m.id === openId && 'bg-pickle/8')}
                  >
                    <span className="flex items-center gap-2">
                      {m.status === 'NEW' && <span className="size-2 shrink-0 rounded-full bg-tomato" aria-label="Unread" />}
                      <span className={cn('flex-1 truncate', m.status === 'NEW' ? 'font-bold' : 'font-semibold')}>{m.name}</span>
                      <span className="shrink-0 text-xs text-ink-muted">{formatRelative(m.createdAt)}</span>
                    </span>
                    <span className="line-clamp-2 text-sm text-ink-muted">{m.message}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {list.data && (
            <div className="mt-auto border-t border-line p-3">
              <Pagination page={list.data.page} size={list.data.size} totalPages={list.data.totalPages} totalElements={list.data.totalElements} onPageChange={setPage} />
            </div>
          )}
        </Panel>

        <Panel className={cn('min-h-[24rem]', openId === null && 'hidden xl:block')}>
          {!message ? (
            <EmptyState
              icon={<MailOpen />}
              title={openId && detail.error ? 'Message not found' : 'Select a message'}
              description={openId && detail.error ? 'It may have been deleted.' : 'Choose a message from the list to read it.'}
            />
          ) : (
            <article className="flex h-full flex-col">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
                <div className="min-w-0">
                  <button type="button" onClick={() => select(null)} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink xl:hidden">
                    <ArrowLeft className="size-4" /> All messages
                  </button>
                  <h2 className="font-sans text-xl font-bold normal-case tracking-normal">{message.name}</h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
                    <a href={`mailto:${message.email}`} className="inline-flex items-center gap-1.5 hover:text-ink">
                      <Mail className="size-4" aria-hidden /> {message.email}
                    </a>
                    {message.phone && (
                      <a href={`tel:${message.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-ink">
                        <Phone className="size-4" aria-hidden /> {message.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="text-sm text-ink-muted">{formatDateTime(message.createdAt)}</span>
                  <span className="flex gap-1.5">
                    <Badge tone={message.status === 'NEW' ? 'primary' : message.status === 'ARCHIVED' ? 'neutral' : 'success'}>{message.status.toLowerCase()}</Badge>
                    {message.locale && <Badge tone="info">{message.locale === 'fr' ? 'Français' : 'English'}</Badge>}
                  </span>
                </div>
              </header>
              <div className="flex-1 whitespace-pre-line p-5 leading-relaxed sm:p-6">{message.message}</div>
              <footer className="flex flex-wrap gap-2 border-t border-line p-4 sm:p-5">
                <Button href={`mailto:${message.email}?subject=${encodeURIComponent('Re: your message to Tasty')}`} icon={<Reply className="size-4" />}>
                  Reply by email
                </Button>
                {message.status !== 'NEW' ? (
                  <Button variant="outline" onClick={() => act(() => messageService.markUnread(message.id), 'Marked as unread')} icon={<Mail className="size-4" />}>
                    Mark unread
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => act(() => messageService.markRead(message.id), 'Marked as read')} icon={<MailOpen className="size-4" />}>
                    Mark read
                  </Button>
                )}
                {message.status !== 'ARCHIVED' && (
                  <Button variant="outline" onClick={() => act(() => messageService.archive(message.id), 'Message archived')} icon={<Archive className="size-4" />}>
                    Archive
                  </Button>
                )}
                <Button variant="ghost" onClick={() => remove(message)} icon={<Trash2 className="size-4" />} className="ml-auto text-danger hover:bg-danger/10">
                  Delete
                </Button>
              </footer>
            </article>
          )}
        </Panel>
      </div>
    </>
  )
}
