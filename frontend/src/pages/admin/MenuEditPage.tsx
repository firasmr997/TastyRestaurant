import { ExternalLink, Save, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router'
import { ApiError } from '@/api/client'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { LangTabs } from '@/components/admin/LangTabs'
import { PageHeader, Panel, PanelHeader } from '@/components/admin/AdminUi'
import { TagInput } from '@/components/admin/TagInput'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog, useConfirm } from '@/components/ui/ConfirmDialog'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { Switch } from '@/components/ui/Switch'
import { useToast } from '@/components/ui/Toast'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { useUploadCleanup } from '@/hooks/useUploadCleanup'
import { categoryService } from '@/services/categoryService'
import { menuService } from '@/services/menuService'
import type { ImageRef, MenuItem, MenuItemInput } from '@/types/models'
import { formatDateTime } from '@/utils/format'

interface FormState {
  name: string
  nameFr: string
  slug: string
  description: string
  descriptionFr: string
  price: string
  categoryId: string
  ingredients: string[]
  ingredientsFr: string[]
  mainImage: ImageRef | null
  additionalImages: ImageRef[]
  available: boolean
  featured: boolean
  vegetarian: boolean
  spicy: boolean
}

const EMPTY: FormState = {
  name: '',
  nameFr: '',
  slug: '',
  description: '',
  descriptionFr: '',
  price: '',
  categoryId: '',
  ingredients: [],
  ingredientsFr: [],
  mainImage: null,
  additionalImages: [],
  available: true,
  featured: false,
  vegetarian: false,
  spicy: false,
}

function fromItem(item: MenuItem): FormState {
  return {
    name: item.name,
    nameFr: item.nameFr ?? '',
    slug: item.slug,
    description: item.description,
    descriptionFr: item.descriptionFr ?? '',
    price: item.price.toFixed(2),
    categoryId: String(item.category.id),
    ingredients: item.ingredients,
    ingredientsFr: item.ingredientsFr,
    mainImage: item.mainImage,
    additionalImages: item.additionalImages,
    available: item.available,
    featured: item.featured,
    vegetarian: item.vegetarian,
    spicy: item.spicy,
  }
}

type Errors = Partial<Record<keyof FormState | string, string>>

function validate(form: FormState): Errors {
  const errors: Errors = {}
  if (!form.name.trim()) errors.name = 'Give the dish a name.'
  else if (form.name.length > 120) errors.name = 'Keep the name under 120 characters.'
  if (!form.description.trim()) errors.description = 'Describe the dish in a sentence or two.'
  else if (form.description.length > 1000) errors.description = 'Keep the description under 1,000 characters.'
  if (form.descriptionFr.length > 1000) errors.descriptionFr = 'Keep the description under 1,000 characters.'
  const price = Number(form.price.replace(',', '.'))
  if (form.price.trim() === '' || Number.isNaN(price)) errors.price = 'Enter a price, e.g. 14.50.'
  else if (price < 0 || price > 99999.99) errors.price = 'The price must be between 0 and 99,999.99.'
  else if (!/^\d+([.,]\d{1,2})?$/.test(form.price.trim())) errors.price = 'Use at most two decimals.'
  if (!form.categoryId) errors.categoryId = 'Choose a category.'
  if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) errors.slug = 'Lowercase words separated by hyphens, e.g. the-tasty-smash.'
  return errors
}

export default function MenuEditPage() {
  const { id } = useParams()
  const editing = id !== undefined
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()
  const uploads = useUploadCleanup()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [initial, setInitial] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  /** Set before programmatic navigation (after save or delete) so the unsaved-changes guard stays quiet. */
  const allowLeave = useRef(false)

  const categories = useQuery('admin:categories:all', (signal) => categoryService.adminList({ size: 100 }, signal))
  const existing = useQuery(editing ? `admin:menu:item:${id}` : null, (signal) => menuService.adminGet(Number(id), signal), { staleTime: 0 })

  useEffect(() => {
    if (existing.data) {
      const state = fromItem(existing.data)
      setForm(state)
      setInitial(state)
    }
  }, [existing.data])

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial])
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => !allowLeave.current && dirty && !saving && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) {
      toast.error('Check the highlighted fields')
      return
    }
    const input: MenuItemInput = {
      name: form.name.trim(),
      nameFr: form.nameFr.trim() || null,
      slug: form.slug.trim() || null,
      description: form.description.trim(),
      descriptionFr: form.descriptionFr.trim() || null,
      price: Number(form.price.replace(',', '.')),
      categoryId: Number(form.categoryId),
      ingredients: form.ingredients,
      ingredientsFr: form.ingredientsFr,
      mainImage: form.mainImage ? { url: form.mainImage.url, storageKey: form.mainImage.storageKey ?? null, altText: form.mainImage.altText || null } : null,
      additionalImages: form.additionalImages.map((image) => ({ url: image.url, storageKey: image.storageKey ?? null, altText: image.altText || null })),
      available: form.available,
      featured: form.featured,
      vegetarian: form.vegetarian,
      spicy: form.spicy,
    }
    setSaving(true)
    try {
      const saved = editing ? await menuService.update(Number(id), input) : await menuService.create(input)
      // Keep what the dish now references; remove uploads that were replaced before saving.
      uploads.discard([saved.mainImage?.storageKey, ...saved.additionalImages.map((image) => image.storageKey)])
      const state = fromItem(saved)
      setForm(state)
      setInitial(state)
      invalidateQueries('admin:menu')
      invalidateQueries('menu:')
      invalidateQueries('dashboard')
      toast.success(editing ? 'Dish updated' : 'Dish created', saved.name)
      if (!editing) {
        allowLeave.current = true
        navigate(`/admin/menu/${saved.id}`, { replace: true })
        allowLeave.current = false
      }
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.length) setErrors(err.byField)
      toast.error('Could not save the dish', err instanceof Error ? err.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  const onDelete = () =>
    confirm({
      title: `Delete “${form.name}”?`,
      description: 'The dish and its uploaded photos are removed from the website. This cannot be undone.',
      confirmLabel: 'Delete dish',
      action: async () => {
        try {
          await menuService.remove(Number(id))
          allowLeave.current = true
          invalidateQueries('admin:menu')
          invalidateQueries('menu:')
          invalidateQueries('dashboard')
          toast.success('Dish deleted', form.name)
          navigate('/admin/menu', { replace: true })
        } catch (err) {
          toast.error('Could not delete the dish', err instanceof Error ? err.message : undefined)
          throw err
        }
      },
    })

  if (editing && existing.error) {
    return (
      <Panel className="p-8 text-center">
        <p className="font-semibold">{existing.error.status === 404 ? 'This dish no longer exists.' : existing.error.message}</p>
        <Button to="/admin/menu" variant="outline" className="mt-4">
          Back to the menu
        </Button>
      </Panel>
    )
  }

  const loading = editing && !existing.data
  const item = existing.data

  return (
    <form noValidate onSubmit={onSubmit} className="pb-24">
      <PageHeader
        title={editing ? form.name || 'Edit dish' : 'New dish'}
        description={editing ? 'Changes go live on the website as soon as you save.' : 'Add a dish to the menu. French fields are optional.'}
        actions={
          editing && item ? (
            <a
              href={`/menu/${item.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-control px-4 text-sm font-semibold text-ink hover:bg-ink/8"
            >
              <ExternalLink className="size-4" /> View on website
            </a>
          ) : undefined
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Panel>
            <PanelHeader title="Details" description="Name and description as guests read them." />
            <div className="p-5 sm:p-6">
              {loading ? (
                <Skeleton className="h-48" />
              ) : (
                <LangTabs
                  frFilled={!!(form.nameFr.trim() && form.descriptionFr.trim())}
                  en={
                    <>
                      <Field label="Name" required error={errors.name}>
                        <Input value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={120} placeholder="The Tasty Smash" />
                      </Field>
                      <Field label="Description" required error={errors.description} hint={`${form.description.length} / 1000`}>
                        <Textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={1000} />
                      </Field>
                    </>
                  }
                  fr={
                    <>
                      <Field label="Nom (français)" error={errors.nameFr} hint="Leave empty to show the English name.">
                        <Input value={form.nameFr} onChange={(e) => set('nameFr', e.target.value)} maxLength={120} />
                      </Field>
                      <Field label="Description (français)" error={errors.descriptionFr} hint={`${form.descriptionFr.length} / 1000`}>
                        <Textarea rows={4} value={form.descriptionFr} onChange={(e) => set('descriptionFr', e.target.value)} maxLength={1000} />
                      </Field>
                    </>
                  }
                />
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Price & category" />
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <Field label="Price" required error={errors.price} hint="In the restaurant currency (Settings).">
                <Input inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="14.50" className="tnum" />
              </Field>
              <Field label="Category" required error={errors.categoryId}>
                <Select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                  <option value="">Choose a category</option>
                  {categories.data?.content.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.active ? '' : ' (hidden)'}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="URL slug"
                error={errors.slug}
                hint={editing ? 'Changing it breaks links shared before.' : 'Optional: generated from the name.'}
                className="sm:col-span-2"
              >
                <Input value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase())} placeholder="the-tasty-smash" />
              </Field>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Ingredients" description="Shown on the dish page and used by the menu search." />
            <div className="p-5 sm:p-6">
              <LangTabs
                frFilled={form.ingredientsFr.length > 0}
                en={<TagInput label="Ingredients" values={form.ingredients} onChange={(v) => set('ingredients', v)} placeholder="e.g. Aged cheddar" />}
                fr={<TagInput label="Ingrédients (français)" values={form.ingredientsFr} onChange={(v) => set('ingredientsFr', v)} placeholder="ex. Cheddar affiné" />}
              />
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel>
            <PanelHeader title="Photos" description="The main photo appears on menu cards." />
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <ImageUploader
                label="Main photo"
                folder="menu"
                value={form.mainImage}
                onChange={(value) => set('mainImage', value)}
                onUploaded={uploads.track}
                aspect="aspect-[4/5]"
                hint="Portrait photos work best (4:5)."
              />
              {form.mainImage && (
                <Field label="Main photo description (alt text)" hint="Describe the photo for screen readers.">
                  <Input value={form.mainImage.altText ?? ''} onChange={(e) => set('mainImage', { ...form.mainImage!, altText: e.target.value })} maxLength={255} />
                </Field>
              )}
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold">More photos</p>
                {form.additionalImages.map((image, index) => (
                  <ImageUploader
                    key={`${image.url}-${index}`}
                    label={`Photo ${index + 2}`}
                    folder="menu"
                    value={image}
                    onUploaded={uploads.track}
                    onChange={(value) =>
                      set(
                        'additionalImages',
                        value ? form.additionalImages.map((img, i) => (i === index ? value : img)) : form.additionalImages.filter((_, i) => i !== index),
                      )
                    }
                  />
                ))}
                {form.additionalImages.length < 12 && (
                  <AddPhoto onUploaded={(ref) => { uploads.track(ref.storageKey!); set('additionalImages', [...form.additionalImages, ref]) }} />
                )}
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Status" />
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <Switch label="Available" description="Off shows the dish as sold out." checked={form.available} onChange={(v) => set('available', v)} />
              <Switch label="Featured" description="Shown in Signatures on the homepage." checked={form.featured} onChange={(v) => set('featured', v)} />
              <Switch label="Vegetarian" checked={form.vegetarian} onChange={(v) => set('vegetarian', v)} />
              <Switch label="Spicy" checked={form.spicy} onChange={(v) => set('spicy', v)} />
            </div>
          </Panel>

          {item && (
            <Panel>
              <PanelHeader title="History" />
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 p-5 text-sm sm:p-6">
                <dt className="text-ink-muted">Created</dt>
                <dd>
                  {formatDateTime(item.createdAt)} {item.createdBy && <span className="text-ink-muted">by {item.createdBy}</span>}
                </dd>
                <dt className="text-ink-muted">Updated</dt>
                <dd>
                  {formatDateTime(item.updatedAt)} {item.updatedBy && <span className="text-ink-muted">by {item.updatedBy}</span>}
                </dd>
              </dl>
            </Panel>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 lg:left-64">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="text-sm text-ink-muted">{dirty ? 'Unsaved changes' : editing ? 'All changes saved' : ''}</div>
          <div className="flex gap-2">
            {editing && (
              <Button variant="ghost" onClick={onDelete} icon={<Trash2 className="size-4" />} className="text-danger hover:bg-danger/10">
                Delete
              </Button>
            )}
            <Button variant="outline" to="/admin/menu">
              Cancel
            </Button>
            <Button type="submit" loading={saving} icon={!saving ? <Save className="size-4" /> : undefined} disabled={loading}>
              {editing ? 'Save changes' : 'Create dish'}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        description="Your changes to this dish will be lost."
        confirmLabel="Leave page"
        cancelLabel="Keep editing"
        onConfirm={() => {
          uploads.discard([initial.mainImage?.storageKey, ...initial.additionalImages.map((i) => i.storageKey)])
          blocker.proceed?.()
        }}
        onCancel={() => blocker.reset?.()}
      />
    </form>
  )
}

/** Empty slot that uploads straight into the "more photos" list. */
function AddPhoto({ onUploaded }: { onUploaded: (ref: ImageRef) => void }) {
  const [value, setValue] = useState<ImageRef | null>(null)
  useEffect(() => {
    if (value) {
      onUploaded(value)
      setValue(null)
    }
  }, [value, onUploaded])
  return (
    <ImageUploader label="Add a photo" folder="menu" value={value} onChange={setValue} aspect="aspect-[3/1]" />
  )
}
