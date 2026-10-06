import { ExternalLink, Pencil, Plus, Search, Trash2, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { PageHeader, Panel, Table, TableSkeleton, Td, Th } from '@/components/admin/AdminUi'
import { Badge } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Field'
import { Pagination } from '@/components/ui/Pagination'
import { SmartImage } from '@/components/ui/SmartImage'
import { Switch } from '@/components/ui/Switch'
import { useToast } from '@/components/ui/Toast'
import { useSettings } from '@/context/SettingsContext'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { categoryService } from '@/services/categoryService'
import { menuService } from '@/services/menuService'
import type { MenuItemSummary, MenuSort } from '@/types/models'
import { formatPrice } from '@/utils/format'

export default function MenuListPage() {
  const [params, setParams] = useSearchParams()
  const { currency } = useSettings()
  const toast = useToast()
  const confirm = useConfirm()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const q = useDebouncedValue(search.trim(), 300)
  const page = Number(params.get('page') ?? 0)
  const size = Number(params.get('size') ?? 10)
  const categoryId = params.get('categoryId') ?? ''
  const available = params.get('available') ?? ''
  const featured = params.get('featured') ?? ''
  const sort = (params.get('sort') as MenuSort | null) ?? 'newest'
  const [pending, setPending] = useState<Record<number, boolean>>({})

  const update = (changes: Record<string, string | number | null>, resetPage = true) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(changes).forEach(([key, value]) => {
        if (value === null || value === '') next.delete(key)
        else next.set(key, String(value))
      })
      if (resetPage && !('page' in changes)) next.delete('page')
      return next
    })
  }

  useEffect(() => {
    if ((params.get('q') ?? '') !== q) update({ q: q || null })
  }, [q])

  const categories = useQuery('admin:categories:all', (signal) => categoryService.adminList({ size: 100 }, signal))
  const key = `admin:menu:${q}|${categoryId}|${available}|${featured}|${sort}|${page}|${size}`
  const { data, isLoading, error, refetch } = useQuery(
    key,
    (signal) =>
      menuService.adminSearch(
        {
          q: q || undefined,
          categoryId: categoryId ? Number(categoryId) : undefined,
          available: available ? available === 'true' : undefined,
          featured: featured ? featured === 'true' : undefined,
          sort,
          page,
          size,
        },
        signal,
      ),
    { keepPrevious: true, staleTime: 5_000 },
  )

  const refresh = () => {
    invalidateQueries('admin:menu')
    invalidateQueries('menu:')
    invalidateQueries('dashboard')
  }

  const toggle = async (item: MenuItemSummary, field: 'available' | 'featured', value: boolean) => {
    setPending((p) => ({ ...p, [item.id]: true }))
    try {
      await menuService.updateStatus(item.id, { [field]: value })
      toast.success(
        field === 'available' ? (value ? `${item.name} is available` : `${item.name} marked sold out`) : value ? `${item.name} is featured` : `${item.name} removed from featured`,
      )
      refresh()
    } catch (err) {
      toast.error('Could not update the dish', err instanceof Error ? err.message : undefined)
    } finally {
      setPending((p) => ({ ...p, [item.id]: false }))
    }
  }

  const remove = (item: MenuItemSummary) =>
    confirm({
      title: `Delete “${item.name}”?`,
      description: 'The dish and its uploaded photos are removed from the website. This cannot be undone.',
      confirmLabel: 'Delete dish',
      action: async () => {
        try {
          await menuService.remove(item.id)
          toast.success('Dish deleted', item.name)
          refresh()
        } catch (err) {
          toast.error('Could not delete the dish', err instanceof Error ? err.message : undefined)
          throw err
        }
      },
    })

  const items = data?.content ?? []
  const filtersActive = !!(q || categoryId || available || featured)

  return (
    <>
      <PageHeader
        title="Menu"
        description="Every dish on the website. Toggle availability during service; changes are live immediately."
        actions={
          <Button to="/admin/menu/new" icon={<Plus className="size-4" />}>
            Add dish
          </Button>
        }
      />
      <Panel>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label htmlFor="menu-search" className="sr-only">
              Search dishes
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
            <input
              id="menu-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, description or ingredient"
              className="h-11 w-full rounded-control border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-ink-faint focus:border-focus focus:outline-none focus:ring-4 focus:ring-focus/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
            <Select aria-label="Category" value={categoryId} onChange={(e) => update({ categoryId: e.target.value })} className="lg:w-48">
              <option value="">All categories</option>
              {categories.data?.content.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.active ? '' : ' (hidden)'}
                </option>
              ))}
            </Select>
            <Select aria-label="Availability" value={available} onChange={(e) => update({ available: e.target.value })} className="lg:w-48">
              <option value="">Any availability</option>
              <option value="true">Available</option>
              <option value="false">Sold out</option>
            </Select>
            <Select aria-label="Featured" value={featured} onChange={(e) => update({ featured: e.target.value })} className="lg:w-48">
              <option value="">Any feature</option>
              <option value="true">Featured</option>
              <option value="false">Not featured</option>
            </Select>
            <Select aria-label="Sort" value={sort} onChange={(e) => update({ sort: e.target.value })} className="lg:w-44">
              <option value="newest">Newest first</option>
              <option value="updated">Recently edited</option>
              <option value="name">Name A–Z</option>
              <option value="menu">Menu order</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
            </Select>
          </div>
        </div>

        {error && !data ? (
          <div className="p-6 text-sm text-danger">
            {error.message}{' '}
            <button type="button" className="font-semibold underline" onClick={refetch}>
              Retry
            </button>
          </div>
        ) : !isLoading && items.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed />}
            title="No dishes found"
            description={filtersActive ? 'No dish matches these filters.' : 'Add the first dish to start the menu.'}
            action={
              filtersActive ? (
                <Button variant="outline" onClick={() => { setSearch(''); setParams(new URLSearchParams()) }}>
                  Clear filters
                </Button>
              ) : (
                <Button to="/admin/menu/new" icon={<Plus className="size-4" />}>
                  Add dish
                </Button>
              )
            }
          />
        ) : (
          <Table caption="Dishes">
            <thead>
              <tr>
                <Th className="w-20">Image</Th>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th className="text-right">Price</Th>
                <Th>Available</Th>
                <Th>Featured</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && items.length === 0 ? (
                <TableSkeleton columns={7} />
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-surface-2/50">
                    <Td>
                      <SmartImage src={item.mainImage?.url} alt="" width={160} sizes="56px" frameClassName="size-14 rounded-control" />
                    </Td>
                    <Td>
                      <Link to={`/admin/menu/${item.id}`} className="font-semibold text-ink hover:text-tomato-deep">
                        {item.name}
                      </Link>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                        {item.nameFr ? <span>FR: {item.nameFr}</span> : <Badge tone="warning">No French name</Badge>}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap">{item.category.name}</Td>
                    <Td className="tnum whitespace-nowrap text-right font-semibold">{formatPrice(item.price, currency)}</Td>
                    <Td>
                      <Switch
                        size="sm"
                        hideLabel
                        label={`${item.name} available`}
                        checked={item.available}
                        disabled={pending[item.id]}
                        onChange={(value) => toggle(item, 'available', value)}
                      />
                    </Td>
                    <Td>
                      <Switch
                        size="sm"
                        hideLabel
                        label={`${item.name} featured`}
                        checked={item.featured}
                        disabled={pending[item.id]}
                        onChange={(value) => toggle(item, 'featured', value)}
                      />
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <a
                          href={`/menu/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${item.name} on the website`}
                          title="View on website"
                          className="inline-flex size-10 items-center justify-center rounded-control hover:bg-ink/8"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                        <Link
                          to={`/admin/menu/${item.id}`}
                          aria-label={`Edit ${item.name}`}
                          title="Edit"
                          className="inline-flex size-10 items-center justify-center rounded-control hover:bg-ink/8"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <IconButton label={`Delete ${item.name}`} onClick={() => remove(item)} className="text-danger hover:bg-danger/10">
                          <Trash2 className="size-4" />
                        </IconButton>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}

        {data && (
          <div className="p-4 sm:px-5">
            <Pagination
              page={data.page}
              size={data.size}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={(p) => update({ page: p }, false)}
              onSizeChange={(s) => update({ size: s })}
            />
          </div>
        )}
      </Panel>
    </>
  )
}
