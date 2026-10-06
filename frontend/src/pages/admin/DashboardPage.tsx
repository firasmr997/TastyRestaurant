import { CheckCircle2, Images, Inbox, MessageSquare, Plus, Star, Tags, Upload, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader, Panel, PanelHeader } from '@/components/admin/AdminUi'
import { ColumnChart, HorizontalBars } from '@/components/admin/BarChart'
import { StatCard } from '@/components/admin/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SmartImage } from '@/components/ui/SmartImage'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { useQuery } from '@/hooks/useQuery'
import { dashboardService } from '@/services/dashboardService'
import { formatPrice, formatRelative } from '@/utils/format'

export default function DashboardPage() {
  const { user } = useAuth()
  const { currency } = useSettings()
  const { data, isLoading, error, refetch } = useQuery('dashboard', (signal) => dashboardService.get(signal), { staleTime: 15_000 })
  const stats = data?.stats

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`${greeting}${user ? `, ${user.name.split(' ')[0]}` : ''}. Here is what guests see on the website right now.`}
        actions={
          <>
            <Button to="/admin/food-images" variant="outline" icon={<Upload className="size-4" />}>
              Upload photos
            </Button>
            <Button to="/admin/menu/new" icon={<Plus className="size-4" />}>
              Add dish
            </Button>
          </>
        }
      />

      {error && !data && (
        <Panel className="mb-6 p-4 text-sm text-danger">
          Could not load the dashboard: {error.message}{' '}
          <button type="button" onClick={refetch} className="font-semibold underline">
            Retry
          </button>
        </Panel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Menu items" value={stats?.totalItems} detail={stats ? `${stats.activeCategories} active categories` : undefined} icon={UtensilsCrossed} to="/admin/menu" loading={isLoading} />
        <StatCard
          label="Available today"
          value={stats?.availableItems}
          detail={stats ? `${stats.totalItems - stats.availableItems} sold out` : undefined}
          icon={CheckCircle2}
          to="/admin/menu?available=false"
          tone="tomato"
          loading={isLoading}
        />
        <StatCard label="Featured dishes" value={stats?.featuredItems} detail="Shown in Signatures on the homepage" icon={Star} to="/admin/menu?featured=true" tone="mustard" loading={isLoading} />
        <StatCard label="Categories" value={stats?.categories} detail={stats ? `${stats.activeCategories} visible on the menu` : undefined} icon={Tags} to="/admin/categories" tone="ink" loading={isLoading} />
        <StatCard
          label="Gallery images"
          value={stats?.galleryImages}
          detail={stats ? `${stats.foodImages} food · ${stats.restaurantImages} restaurant` : undefined}
          icon={Images}
          to="/admin/food-images"
          loading={isLoading}
        />
        <StatCard
          label="Unread messages"
          value={stats?.unreadMessages}
          detail={stats ? `${stats.totalMessages} messages in total` : undefined}
          icon={MessageSquare}
          to="/admin/messages?status=NEW"
          tone="tomato"
          loading={isLoading}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Panel className="xl:col-span-3">
          <PanelHeader title="Messages received" description="Contact-form messages per day, last 14 days" />
          <div className="p-5 sm:p-6">
            {data ? (
              <ColumnChart
                unit="messages"
                data={data.messagesPerDay.map((d) => {
                  const date = new Date(`${d.date}T00:00:00`)
                  return {
                    key: d.date,
                    label: date.toLocaleDateString('en-US', { day: 'numeric' }),
                    fullLabel: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
                    value: d.count,
                  }
                })}
              />
            ) : (
              <span className="skeleton block h-[13rem] rounded" />
            )}
          </div>
        </Panel>
        <Panel className="xl:col-span-2">
          <PanelHeader title="Dishes per category" description="Includes sold-out dishes" />
          <div className="p-5 sm:p-6">
            {data ? (
              <HorizontalBars unit="dishes" data={data.itemsPerCategory.map((c) => ({ key: String(c.categoryId), label: c.name, value: c.count }))} />
            ) : (
              <span className="skeleton block h-[13rem] rounded" />
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Recently added dishes"
            actions={
              <Link to="/admin/menu" className="text-sm font-semibold text-tomato-deep hover:underline">
                All dishes
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {(data?.recentItems ?? []).map((item) => (
              <li key={item.id}>
                <Link to={`/admin/menu/${item.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2 sm:px-6">
                  <SmartImage src={item.mainImage?.url} alt="" width={160} sizes="48px" frameClassName="size-12 shrink-0 rounded-control" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{item.name}</span>
                    <span className="block text-xs text-ink-muted">
                      {item.category.name} · added {formatRelative(item.createdAt)}
                    </span>
                  </span>
                  <span className="tnum text-sm font-semibold">{formatPrice(item.price, currency)}</span>
                </Link>
              </li>
            ))}
            {isLoading &&
              Array.from({ length: 4 }, (_, i) => (
                <li key={i} className="flex items-center gap-3 px-6 py-3" aria-hidden>
                  <span className="skeleton size-12 rounded-control" />
                  <span className="skeleton h-4 flex-1 rounded" />
                </li>
              ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader
            title="Latest messages"
            actions={
              <Link to="/admin/messages" className="text-sm font-semibold text-tomato-deep hover:underline">
                Open inbox
              </Link>
            }
          />
          {data && data.recentMessages.length === 0 ? (
            <EmptyState icon={<Inbox />} title="No messages" description="Messages sent from the contact page will appear here." />
          ) : (
            <ul className="divide-y divide-line">
              {(data?.recentMessages ?? []).map((message) => (
                <li key={message.id}>
                  <Link to={`/admin/messages?open=${message.id}`} className="block px-5 py-3 transition-colors hover:bg-surface-2 sm:px-6">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold">{message.name}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        {message.status === 'NEW' && <Badge tone="primary">New</Badge>}
                        <span className="text-xs text-ink-muted">{formatRelative(message.createdAt)}</span>
                      </span>
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-sm text-ink-muted">{message.message}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
