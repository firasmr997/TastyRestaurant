import { Pencil, Plus, Search, Tags, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ApiError } from '@/api/client'
import { LangTabs } from '@/components/admin/LangTabs'
import { PageHeader, Panel, Table, TableSkeleton, Td, Th } from '@/components/admin/AdminUi'
import { Badge } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { Switch } from '@/components/ui/Switch'
import { useToast } from '@/components/ui/Toast'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { invalidateQueries, useQuery } from '@/hooks/useQuery'
import { categoryService } from '@/services/categoryService'
import type { Category, CategoryInput } from '@/types/models'

const EMPTY: CategoryInput = { name: '', nameFr: '', description: '', descriptionFr: '', displayOrder: 0, active: true }

export default function CategoriesPage() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const q = useDebouncedValue(search.trim(), 300)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [reassignTo, setReassignTo] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data, isLoading, error, refetch } = useQuery(
    `admin:categories:list:${q}:${page}:${size}`,
    (signal) => categoryService.adminList({ q: q || undefined, page, size }, signal),
    { keepPrevious: true, staleTime: 5_000 },
  )
  const all = useQuery('admin:categories:all', (signal) => categoryService.adminList({ size: 100 }, signal))

  const refresh = () => {
    invalidateQueries('admin:categories')
    invalidateQueries('categories:')
    invalidateQueries('menu:')
    invalidateQueries('admin:menu')
    invalidateQueries('dashboard')
  }

  const confirmDelete = async () => {
    if (!deleting) return
    if (deleting.itemCount > 0 && !reassignTo) {
      toast.error('Choose where to move the dishes first')
      return
    }
    setDeleteLoading(true)
    try {
      await categoryService.remove(deleting.id, deleting.itemCount > 0 ? Number(reassignTo) : undefined)
      toast.success('Category deleted', deleting.itemCount > 0 ? `${deleting.itemCount} dishes moved.` : deleting.name)
      setDeleting(null)
      refresh()
    } catch (err) {
      toast.error('Could not delete the category', err instanceof Error ? err.message : undefined)
    } finally {
      setDeleteLoading(false)
    }
  }

  const categories = data?.content ?? []

  return (
    <>
      <PageHeader
        title="Categories"
        description="Sections of the menu, in display order. Hidden categories disappear from the website with their dishes."
        actions={
          <Button onClick={() => setEditing('new')} icon={<Plus className="size-4" />}>
            Add category
          </Button>
        }
      />
      <Panel>
        <div className="border-b border-line p-4 sm:p-5">
          <div className="relative max-w-md">
            <label htmlFor="category-search" className="sr-only">
              Search categories
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
            <input
              id="category-search"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              placeholder="Search categories"
              className="h-11 w-full rounded-control border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-ink-faint focus:border-focus focus:outline-none focus:ring-4 focus:ring-focus/20"
            />
          </div>
        </div>
        {error && !data ? (
          <div className="p-6 text-sm text-danger">
            {error.message}{' '}
            <button type="button" className="font-semibold underline" onClick={refetch}>
              Retry
            </button>
          </div>
        ) : !isLoading && categories.length === 0 ? (
          <EmptyState
            icon={<Tags />}
            title="No categories"
            description={q ? 'No category matches this search.' : 'Create the first menu section.'}
            action={!q && <Button onClick={() => setEditing('new')}>Add category</Button>}
          />
        ) : (
          <Table caption="Categories">
            <thead>
              <tr>
                <Th className="w-20">Order</Th>
                <Th>Name</Th>
                <Th>French</Th>
                <Th className="text-right">Dishes</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && categories.length === 0 ? (
                <TableSkeleton columns={6} />
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-surface-2/50">
                    <Td className="tnum font-semibold">{category.displayOrder}</Td>
                    <Td>
                      <span className="font-semibold">{category.name}</span>
                      <span className="block text-xs text-ink-muted">/menu/category/{category.slug}</span>
                    </Td>
                    <Td>{category.nameFr ?? <Badge tone="warning">Missing</Badge>}</Td>
                    <Td className="tnum text-right">
                      <Link to={`/admin/menu?categoryId=${category.id}`} className="font-semibold hover:text-tomato-deep hover:underline">
                        {category.itemCount}
                      </Link>
                    </Td>
                    <Td>{category.active ? <Badge tone="success">Visible</Badge> : <Badge>Hidden</Badge>}</Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <IconButton label={`Edit ${category.name}`} onClick={() => setEditing(category)}>
                          <Pencil className="size-4" />
                        </IconButton>
                        <IconButton
                          label={`Delete ${category.name}`}
                          onClick={() => {
                            setReassignTo('')
                            setDeleting(category)
                          }}
                          className="text-danger hover:bg-danger/10"
                        >
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
              onPageChange={setPage}
              onSizeChange={(s) => {
                setSize(s)
                setPage(0)
              }}
            />
          </div>
        )}
      </Panel>

      <CategoryFormModal
        key={editing === 'new' ? 'new' : editing?.id ?? 'closed'}
        category={editing}
        onClose={() => setEditing(null)}
        onSaved={(saved, created) => {
          toast.success(created ? 'Category created' : 'Category updated', saved.name)
          setEditing(null)
          refresh()
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        loading={deleteLoading}
        title={`Delete “${deleting?.name ?? ''}”?`}
        description={
          deleting && deleting.itemCount > 0
            ? `${deleting.itemCount} ${deleting.itemCount === 1 ? 'dish belongs' : 'dishes belong'} to this category. Move them to another category before it is deleted.`
            : 'The category is removed from the menu. This cannot be undone.'
        }
        body={
          deleting && deleting.itemCount > 0 ? (
            <Field label="Move the dishes to" required>
              <Select value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
                <option value="">Choose a category</option>
                {all.data?.content
                  .filter((c) => c.id !== deleting.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Select>
            </Field>
          ) : undefined
        }
        confirmLabel={deleting && deleting.itemCount > 0 ? 'Move dishes & delete' : 'Delete category'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}

function CategoryFormModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | 'new' | null
  onClose: () => void
  onSaved: (category: Category, created: boolean) => void
}) {
  const creating = category === 'new'
  const initial: CategoryInput =
    category && category !== 'new'
      ? {
          name: category.name,
          nameFr: category.nameFr ?? '',
          slug: category.slug,
          description: category.description ?? '',
          descriptionFr: category.descriptionFr ?? '',
          displayOrder: category.displayOrder,
          active: category.active,
        }
      : EMPTY
  const [form, setForm] = useState<CategoryInput>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found: Record<string, string> = {}
    if (!form.name.trim()) found.name = 'Give the category a name.'
    if (!Number.isInteger(form.displayOrder) || form.displayOrder < 0) found.displayOrder = 'Use a whole number from 0.'
    if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) found.slug = 'Lowercase words separated by hyphens.'
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    try {
      const payload: CategoryInput = {
        ...form,
        name: form.name.trim(),
        nameFr: form.nameFr?.trim() || null,
        slug: form.slug?.trim() || null,
        description: form.description?.trim() || null,
        descriptionFr: form.descriptionFr?.trim() || null,
      }
      const saved = creating ? await categoryService.create(payload) : await categoryService.update((category as Category).id, payload)
      onSaved(saved, creating)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.length) setErrors(err.byField)
        else setErrors({ form: err.message })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={category !== null}
      onClose={onClose}
      dismissible={!saving}
      title={creating ? 'New category' : `Edit ${initial.name}`}
      description="Shown as a section of the menu, in display order."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" loading={saving}>
            {creating ? 'Create category' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form id="category-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        {errors.form && (
          <p role="alert" className="rounded-control bg-danger/8 px-3 py-2 text-sm font-medium text-danger">
            {errors.form}
          </p>
        )}
        <LangTabs
          frFilled={!!form.nameFr?.trim()}
          en={
            <>
              <Field label="Name" required error={errors.name}>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={80} data-autofocus />
              </Field>
              <Field label="Description" error={errors.description}>
                <Textarea rows={3} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} maxLength={500} />
              </Field>
            </>
          }
          fr={
            <>
              <Field label="Nom (français)" error={errors.nameFr}>
                <Input value={form.nameFr ?? ''} onChange={(e) => set('nameFr', e.target.value)} maxLength={80} />
              </Field>
              <Field label="Description (français)" error={errors.descriptionFr}>
                <Textarea rows={3} value={form.descriptionFr ?? ''} onChange={(e) => set('descriptionFr', e.target.value)} maxLength={500} />
              </Field>
            </>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Display order" required error={errors.displayOrder} hint="Lower numbers come first.">
            <Input type="number" min={0} max={9999} value={form.displayOrder} onChange={(e) => set('displayOrder', Number(e.target.value))} className="tnum" />
          </Field>
          <Field label="URL slug" error={errors.slug} hint={creating ? 'Optional: generated from the name.' : undefined}>
            <Input value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value.toLowerCase())} placeholder="burgers" />
          </Field>
        </div>
        <Switch label="Visible on the website" description="Hidden categories keep their dishes but take them off the menu." checked={form.active} onChange={(v) => set('active', v)} />
      </form>
    </Modal>
  )
}
