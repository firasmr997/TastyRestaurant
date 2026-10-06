import { ImagePlus, LoaderCircle, RefreshCw, Trash2, Upload } from 'lucide-react'
import { useId, useRef, useState, type DragEvent } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'
import { useToast } from '@/components/ui/Toast'
import { ACCEPTED_IMAGE_TYPES, imageService, validateImageFile } from '@/services/imageService'
import type { ImageRef, StorageFolder } from '@/types/models'
import { cn } from '@/utils/cn'

interface ImageUploaderProps {
  label: string
  value: ImageRef | null
  onChange: (value: ImageRef | null) => void
  folder: StorageFolder
  /** Called with every key uploaded through this control, so the form can clean up if cancelled. */
  onUploaded?: (storageKey: string) => void
  aspect?: string
  hint?: string
  error?: string
}

/**
 * Single image slot: drag & drop or browse, client-side type/size check, upload progress, preview,
 * replace and remove. The server validates the file again (type, extension, signature, size).
 */
export function ImageUploader({ label, value, onChange, folder, onUploaded, aspect = 'aspect-[4/3]', hint, error }: ImageUploaderProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const [progress, setProgress] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)

  const upload = async (file: File) => {
    const problem = validateImageFile(file)
    if (problem) {
      toast.error('Image not accepted', problem)
      return
    }
    setProgress(0)
    try {
      const result = await imageService.upload(file, folder, setProgress)
      onUploaded?.(result.storageKey)
      onChange({ url: result.url, storageKey: result.storageKey, altText: value?.altText ?? '' })
      toast.success('Image uploaded')
    } catch (err) {
      toast.error('Upload failed', err instanceof Error ? err.message : undefined)
    } finally {
      setProgress(null)
      if (input.current) input.current.value = ''
    }
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void upload(file)
  }

  const busy = progress !== null
  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-sm font-semibold">
        {label}
      </span>
      <input
        ref={input}
        id={id}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="sr-only"
        aria-labelledby={`${id}-label`}
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      {value?.url ? (
        <div className={cn('group relative overflow-hidden rounded-card border border-line bg-surface-2', aspect)}>
          <SmartImage src={value.url} alt={value.altText || label} width={720} sizes="400px" frameClassName="h-full w-full" />
          {busy && <ProgressOverlay progress={progress} />}
          <div className="absolute inset-x-2 bottom-2 flex gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-control bg-surface/95 text-sm font-semibold shadow-card hover:bg-surface"
            >
              <RefreshCw className="size-4" aria-hidden /> Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={busy}
              aria-label={`Remove ${label.toLowerCase()}`}
              className="inline-flex size-9 items-center justify-center rounded-control bg-surface/95 text-danger shadow-card hover:bg-danger hover:text-white"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          disabled={busy}
          aria-describedby={`${id}-hint`}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-4 text-center transition-colors',
            aspect,
            dragging ? 'border-tomato bg-tomato/6' : error ? 'border-danger bg-danger/4' : 'border-line bg-surface-2/60 hover:border-pickle hover:bg-pickle/4',
          )}
        >
          {busy ? (
            <ProgressOverlay progress={progress} />
          ) : (
            <>
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-pickle/10 text-pickle">
                {dragging ? <Upload className="size-5" /> : <ImagePlus className="size-5" />}
              </span>
              <span className="text-sm font-semibold">Drop an image or browse</span>
              <span className="text-xs text-ink-muted">JPG, PNG, WebP or AVIF · up to 8 MB</span>
            </>
          )}
        </button>
      )}
      <p id={`${id}-hint`} className={cn('text-xs', error ? 'font-medium text-danger' : 'text-ink-muted')}>
        {error ?? hint}
      </p>
    </div>
  )
}

function ProgressOverlay({ progress }: { progress: number | null }) {
  return (
    <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface/85 text-sm font-semibold" role="status">
      <LoaderCircle className="size-6 animate-spin text-pickle" aria-hidden />
      Uploading {progress ?? 0}%
      <span className="block h-1.5 w-2/3 overflow-hidden rounded-full bg-line">
        <span className="block h-full bg-pickle transition-[width]" style={{ width: `${progress ?? 0}%` }} />
      </span>
    </span>
  )
}
