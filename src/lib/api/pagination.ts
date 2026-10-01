export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

export function pageRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize
  return { from, to: from + pageSize - 1 }
}
