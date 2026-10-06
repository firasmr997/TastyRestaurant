import { ImageOff, Link2, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { SmartImage } from '@/components/ui/SmartImage'
import { Switch } from '@/components/ui/Switch'
import { useToast } from '@/components/ui/Toast'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { useUploadCleanup } from '@/hooks/useUploadCleanup'
import { galleryService } from '@/services/galleryService'
import { menuService } from '@/services/menuService'
import {
  FOOD_CATEGORIES,
  RESTAURANT_CATEGORIES,
  type GalleryCategory,
  type GalleryGroup,
  type GalleryImage,
  type GalleryImageInput,
  type ImageRef,
  type StorageFolder,
} from '@/types/models'
import { cn } from '@/utils/cn'
import { PageHeader, Panel } from './AdminUi'
import { ImageUploader } from './ImageUploader'
import { LangTabs } from './LangTabs'

export const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  FOOD: 'Food',
  SANDWICH: 'Sandwiches',
  BURGER: 'Burgers',
  PLATE: 'Plates',
  DESSERT: 'Desserts',
  DRINK: 'Drinks',
  EXTERIOR: 'Exterior',
  INTERIOR: 'Interior',
  DINING: 'Dining area',
  KITCHEN: 'Kitchen',
  BAR: 'Bar',
  TEAM: 'Team',
  ATMOSPHERE: 'Atmosphere',
}

function folderFor(category: GalleryCategory): StorageFolder {
  if (category === 'TEAM') return 'team'
  return (FOOD_CATEGORIES as readonly string[]).includes(category) ? 'gallery' : 'restaurant'
}

const COPY: Record<GalleryGroup, { title: string; description: string }> = {
  FOOD: {
    title: 'Food Images',
    description: 'Photos for the food gallery and the homepage. The first featured burger photo is the homepage hero.',
  },
  RESTAURANT: {
    title: 'Restaurant Gallery',
    description: 'The room, the bar, the kitchen and the team. Featured photos appear on the homepage and the About page.',
  },
}

/** Shared manager for the two galleries: filter, search, upload, replace, feature, assign and delete. */
export function GalleryManager({ group }: { group: GalleryGroup }) {
  const toast = useToast()
  const confirm = useConfirm()
  const categories = group === 'FOOD' ? FOOD_CATEGORIES : RESTAURANT_CATEGORIES
  const [category, setCategory] = useState<GalleryCategory | ''>('')
  const [search, setSearch] = useState('')
  const q = useDebouncedValue(search.trim(), 300)
  const [featured, setFeatured] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(24)
  const [editing, setEditing] = useState<GalleryImage | 'new' | null>(null)

  const key = `admin:gallery:${group}:${category}:${q}:${featured}:${page}:${size}`
  const { data, isLoading, error, refetch } = useQuery(
    key,
    (signal) =>
      galleryService.adminList(
        {
          group,
          category: category ? [category] : undefined,
          q: q || undefined,
          featured: featured ? featured === 'true' : undefined,
          page,
          size,
        },
        signal,
      ),
    { keepPrevious: true, staleTime: 5_000 },
  )

  const refresh = () => {
    invalidateQueries('admin:gallery')
    invalidateQueries('gallery:')
    invalidateQueries('dashboard')
  }

  const toInput = (image: GalleryImage, changes: Partial<GalleryImageInput> = {}): GalleryImageInput => ({
    title: image.title,
    titleFr: image.titleFr,
    description: image.description,
    descriptionFr: image.descriptionFr,
    imageUrl: image.imageUrl,
    storageKey: image.storageKey,
    altText: image.altText,
    category: image.category,
    displayOrder: image.displayOrder,
    featured: image.featured,
    menuItemId: image.menuItem?.id ?? null,
    ...changes,
  })

  const toggleFeatured = async (image: GalleryImage) => {
    try {
      await galleryService.update(image.id, toInput(image, { featured: !image.featured }))
      toast.success(image.featured ? 'Removed from featured' : 'Marked as featured', image.title)
      refresh()
    } catch (err) {
      toast.error('Could not update the photo', err instanceof Error ? err.message : undefined)
    }
  }

  const remove = (image: GalleryImage) =>
    confirm({
      title: `Delete “${image.title}”?`,
      description: 'The photo is removed from the website and its uploaded file is deleted. This cannot be undone.',
      confirmLabel: 'Delete photo',
      action: async () => {
        try {
          await galleryService.remove(image.id)
          toast.success('Photo deleted', image.title)
          refresh()
        } catch (err) {
          toast.error('Could not delete the photo', err instanceof Error ? err.message : undefined)
          throw err
        }
      },
    })

  const images = data?.content ?? []
  const copy = COPY[group]

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <Button onClick={() => setEditing('new')} icon={<Plus className="size-4" />}>
            Upload photo
          </Button>
        }
      />
      <Panel>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:p-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {(['', ...categories] as (GalleryCategory | '')[]).map((value) => (
              <button
                key={value || 'all'}
                type="button"
                aria-pressed={category === value}
                onClick={() => {
                  setCategory(value)
                  setPage(0)
                }}
                className={cn(
                  'h-9 rounded-full border px-3.5 text-sm font-semibold transition-colors',
                  category === value ? 'border-tomato bg-tomato text-white' : 'border-line bg-surface hover:border-ink/40',
                )}
              >
                {value ? CATEGORY_LABELS[value] : 'All'}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor={`gallery-search-${group}`} className="sr-only">
                Search photos
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
              <input
                id={`gallery-search-${group}`}
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                placeholder="Search titles and descriptions"
                className="h-11 w-full rounded-control border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-ink-faint focus:border-focus focus:outline-none focus:ring-4 focus:ring-focus/20"
              />
            </div>
            <Select aria-label="Featured" value={featured} onChange={(e) => { setFeatured(e.target.value); setPage(0) }} className="sm:w-48">
              <option value="">Featured or not</option>
              <option value="true">Featured only</option>
              <option value="false">Not featured</option>
            </Select>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {error && !data ? (
            <p className="text-sm text-danger">
              {error.message}{' '}
              <button type="button" className="font-semibold underline" onClick={refetch}>
                Retry
              </button>
            </p>
          ) : !isLoading && images.length === 0 ? (
            <EmptyState
              icon={<ImageOff />}
              title="No gallery images available"
              description={category || q || featured ? 'No photo matches these filters.' : 'Upload the first photo for this gallery.'}
              action={<Button onClick={() => setEditing('new')}>Upload photo</Button>}
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {isLoading && images.length === 0
                ? Array.from({ length: 8 }, (_, i) => (
                    <li key={i} aria-hidden className="overflow-hidden rounded-card border border-line">
                      <span className="skeleton block aspect-[4/3]" />
                      <span className="block p-3">
                        <span className="skeleton block h-4 w-2/3 rounded" />
                      </span>
                    </li>
                  ))
                : images.map((image) => (
                    <li key={image.id} className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-card">
                      <div className="relative">
                        <SmartImage src={image.imageUrl} alt={image.altText || image.title} width={640} sizes="(min-width: 1536px) 20vw, (min-width: 1024px) 28vw, 45vw" frameClassName="aspect-[4/3]" />
                        <button
                          type="button"
                          onClick={() => toggleFeatured(image)}
                          aria-pressed={image.featured}
                          aria-label={image.featured ? `Remove ${image.title} from featured` : `Feature ${image.title}`}
                          className={cn(
                            'absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-full border-2 border-label shadow-card transition-colors',
                            image.featured ? 'bg-mustard text-ink' : 'bg-surface/90 text-ink-muted hover:text-ink',
                          )}
                        >
                          <Star className={cn('size-4', image.featured && 'fill-current')} />
                        </button>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-3.5">
                        <p className="line-clamp-1 font-semibold" title={image.title}>
                          {image.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge>{CATEGORY_LABELS[image.category]}</Badge>
                          <Badge tone="neutral" className="tnum">
                            #{image.displayOrder}
                          </Badge>
                          {!image.titleFr && <Badge tone="warning">No FR title</Badge>}
                        </div>
                        {image.menuItem && (
                          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                            <Link2 className="size-3.5" aria-hidden /> {image.menuItem.name}
                          </p>
                        )}
                        <div className="mt-auto flex justify-end gap-1 pt-1">
                          <IconButton label={`Edit ${image.title}`} onClick={() => setEditing(image)}>
                            <Pencil className="size-4" />
                          </IconButton>
                          <IconButton label={`Delete ${image.title}`} onClick={() => remove(image)} className="text-danger hover:bg-danger/10">
                            <Trash2 className="size-4" />
                          </IconButton>
                        </div>
                      </div>
                    </li>
                  ))}
            </ul>
          )}
        </div>
        {data && (
          <div className="border-t border-line p-4 sm:px-5">
            <Pagination
              page={data.page}
              size={data.size}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={setPage}
              onSizeChange={(s) => {
                setSize(s)
                setPage(0)
              }}
              sizeOptions={[12, 24, 48]}
            />
          </div>
        )}
      </Panel>

      <GalleryFormModal
        key={editing === 'new' ? 'new' : editing?.id ?? 'closed'}
        group={group}
        image={editing}
        onClose={() => setEditing(null)}
        onSaved={(saved, created) => {
          toast.success(created ? 'Photo added' : 'Photo updated', saved.title)
          setEditing(null)
          refresh()
        }}
      />
    </>
  )
}

function GalleryFormModal({
  group,
  image,
  onClose,
  onSaved,
}: {
  group: GalleryGroup
  image: GalleryImage | 'new' | null
  onClose: () => void
  onSaved: (image: GalleryImage, created: boolean) => void
}) {
  const creating = image === 'new'
  const existing = image && image !== 'new' ? image : null
  const categories = group === 'FOOD' ? FOOD_CATEGORIES : RESTAURANT_CATEGORIES
  const uploads = useUploadCleanup()
  const [photo, setPhoto] = useState<ImageRef | null>(existing ? { url: existing.imageUrl, storageKey: existing.storageKey, altText: existing.altText } : null)
  const [form, setForm] = useState({
    title: existing?.title ?? '',
    titleFr: existing?.titleFr ?? '',
    description: existing?.description ?? '',
    descriptionFr: existing?.descriptionFr ?? '',
    category: (existing?.category ?? categories[0]) as GalleryCategory,
    displayOrder: existing?.displayOrder ?? 0,
    featured: existing?.featured ?? false,
    menuItemId: existing?.menuItem?.id ? String(existing.menuItem.id) : '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const dishes = useQuery(group === 'FOOD' && image !== null ? 'admin:menu:options' : null, (signal) => menuService.adminSearch({ size: 100, sort: 'name' }, signal))

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const close = () => {
    uploads.discard(existing?.storageKey ? [existing.storageKey] : [])
    onClose()
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found: Record<string, string> = {}
    if (!photo?.url) found.imageUrl = 'Upload a photo first.'
    if (!form.title.trim()) found.title = 'Give the photo a title.'
    if (!Number.isInteger(form.displayOrder) || form.displayOrder < 0) found.displayOrder = 'Use a whole number from 0.'
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    const payload: GalleryImageInput = {
      title: form.title.trim(),
      titleFr: form.titleFr.trim() || null,
      description: form.description.trim() || null,
      descriptionFr: form.descriptionFr.trim() || null,
      imageUrl: photo!.url,
      storageKey: photo!.storageKey ?? null,
      altText: photo!.altText?.trim() || null,
      category: form.category,
      displayOrder: form.displayOrder,
      featured: form.featured,
      menuItemId: form.menuItemId ? Number(form.menuItemId) : null,
    }
    try {
      const saved = existing ? await galleryService.update(existing.id, payload) : await galleryService.create(payload)
      uploads.discard([saved.storageKey])
      onSaved(saved, creating)
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors.length ? err.byField : { form: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={image !== null}
      onClose={close}
      dismissible={!saving}
      size="lg"
      title={creating ? 'Upload a photo' : 'Edit photo'}
      description={creating ? 'Upload the image, then describe it for guests and screen readers.' : 'Replace the image or update its details.'}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="gallery-form" loading={saving}>
            {creating ? 'Add to gallery' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form id="gallery-form" noValidate onSubmit={onSubmit} className="grid gap-6 md:grid-cols-2">
        {errors.form && (
          <p role="alert" className="rounded-control bg-danger/8 px-3 py-2 text-sm font-medium text-danger md:col-span-2">
            {errors.form}
          </p>
        )}
        <div className="flex flex-col gap-4">
          <ImageUploader
            label="Photo"
            folder={folderFor(form.category)}
            value={photo}
            onChange={setPhoto}
            onUploaded={uploads.track}
            aspect="aspect-[4/3]"
            error={errors.imageUrl}
            hint="Large landscape or portrait photos (at least 1600px wide) look best."
          />
          {photo && (
            <Field label="Alt text" hint="What is in the photo, for screen readers.">
              <Input value={photo.altText ?? ''} onChange={(e) => setPhoto({ ...photo, altText: e.target.value })} maxLength={255} />
            </Field>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <LangTabs
            frFilled={!!form.titleFr.trim()}
            en={
              <>
                <Field label="Title" required error={errors.title}>
                  <Input value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={150} />
                </Field>
                <Field label="Description" error={errors.description}>
                  <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={600} />
                </Field>
              </>
            }
            fr={
              <>
                <Field label="Titre (français)" error={errors.titleFr}>
                  <Input value={form.titleFr} onChange={(e) => set('titleFr', e.target.value)} maxLength={150} />
                </Field>
                <Field label="Description (français)" error={errors.descriptionFr}>
                  <Textarea rows={3} value={form.descriptionFr} onChange={(e) => set('descriptionFr', e.target.value)} maxLength={600} />
                </Field>
              </>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" required error={errors.category}>
              <Select value={form.category} onChange={(e) => set('category', e.target.value as GalleryCategory)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Display order" required error={errors.displayOrder} hint="Lower numbers first.">
              <Input type="number" min={0} max={9999} value={form.displayOrder} onChange={(e) => set('displayOrder', Number(e.target.value))} className="tnum" />
            </Field>
          </div>
          {group === 'FOOD' && (
            <Field label="Assign to a dish" hint="Shows a “See this dish” link in the gallery.">
              <Select value={form.menuItemId} onChange={(e) => set('menuItemId', e.target.value)}>
                <option value="">No dish</option>
                {dishes.data?.content.map((dish) => (
                  <option key={dish.id} value={dish.id}>
                    {dish.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Switch label="Featured" description="Featured photos appear first and on the homepage." checked={form.featured} onChange={(v) => set('featured', v)} />
        </div>
      </form>
    </Modal>
  )
}
