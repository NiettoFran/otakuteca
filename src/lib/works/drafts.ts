import type { WorkFormValues } from './types'

export const draftKey = (id?: number | string) => `otakuteca:draft:${id ?? 'new'}`

export const saveDraft = (key: string, values: WorkFormValues) => {
  try {
    localStorage.setItem(key, JSON.stringify(values))
  } catch {
    // sin borrador: se sigue igual
  }
}

export const loadDraft = (key: string): WorkFormValues | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as WorkFormValues) : null
  } catch {
    return null
  }
}

export const clearDraft = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {
    // sin borrador: se sigue igual
  }
}
