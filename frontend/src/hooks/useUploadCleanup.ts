import { useCallback, useEffect, useRef } from 'react'
import { imageService } from '@/services/imageService'

/**
 * Remembers images uploaded while a form is open. If the form is left without saving, those uploads
 * are deleted again (best effort) so abandoned files do not pile up in storage.
 */
export function useUploadCleanup() {
  const pending = useRef(new Set<string>())

  const track = useCallback((storageKey: string) => {
    pending.current.add(storageKey)
  }, [])

  /** Deletes tracked uploads that are not in `keep` (e.g. an image replaced again before saving). */
  const discard = useCallback((keep: (string | null | undefined)[] = []) => {
    const keepSet = new Set(keep.filter(Boolean))
    pending.current.forEach((key) => {
      if (!keepSet.has(key)) void imageService.deleteUnused(key).catch(() => undefined)
    })
    pending.current.clear()
  }, [])

  useEffect(() => () => discard(), [discard])

  return { track, discard }
}
